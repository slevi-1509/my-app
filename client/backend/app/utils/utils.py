# from fastapi import WebSocket, WebSocketDisconnect
# import os
from scapy.all import DNS, DNSQR, TCP, DHCP, Ether, IP
from datetime import datetime
from itertools import count
from scapy.all import sniff
import redis
import logging
import threading
import ipaddress
import socket
import nmap
# import requests
# import ast
import time
import config as config
from models.PacketSummary import PackageSummary
from models.NewDevice import NewDevice
from utils.dhcp_fingerprint import handle_dhcp_packet
from kafka_producer.producer import produce_message
from kafka_producer.produce_schema import ProduceMessage

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

new_devices = {}
packets_to_send = {}
new_devices_sent_to_ai = {}
router_mac = ''
device_mac = ''

def start_sniffer(interface, params):
    global router_mac
    packets_to_process = []
    send_msg(f"Starting sniffer on {interface.name} - {interface.ip}")
    # logger.info(f"Starting sniffer on interface {interface.name} with IP {interface.ip}")
    # websocket.send_text(f"Starting sniffer on interface {interface.name} with IP {interface.ip}")
    network = ipaddress.ip_network(f"{interface.ip}/24", strict=False)
    router_mac = interface.mac.upper()
    filter = "tcp or udp or icmp"
    for i in count(0):
        packets_to_process.clear()
        packets_to_send.clear()
        new_devices.clear()
        get_devices_from_redis(params.interface)
        # sniff(iface=interface, filter=filter, stop_filter=config.stop_sniff_flag, prn=lambda pkt: handle_packet(pkt, network, params.iot_probability),
        sniff(iface=interface, filter=filter, stop_filter=config.stop_sniff_flag, prn=lambda pkt: packets_to_process.append(pkt),
                count=int(params.no_of_packets), store=0)
        index = 0
        while not config.stop_sniff_flag and index < len(packets_to_process):
            handle_packet(packets_to_process[index], network, params.iot_probability)
            index += 1
        send_msg(f"Session: {i+1} - Sniffed {len(packets_to_process)} packets")
        # logger.info(f"Session: {i+1} - Sniffed {len(packets_to_process)} packets")
        if config.stop_sniff_flag:
            send_msg("Sniffer stopped by user")
            # logger.info("Sniffer stopped by user")
            config.stop_sniff_flag = False
            return
        if packets_to_send:
            thread = threading.Thread(target=handle_sending_packets, args=(params.ports_scan, params.os_detect, params.collect_data_time))
            thread.start()
            time.sleep(int(params.interval))
            if thread:
                thread.join()
        if i == int(params.no_of_sessions)-1:
            new_devices_sent_to_ai.clear()
            # logger.info("Sniffer finished current running")
            send_msg("Sniffer finished current running")
            break

def send_msg(msg):
    config.msg_to_client = msg
    logger.info(msg)

def get_devices_from_redis(router_mac=None):
    config.registered_devices.clear()
    r = redis.Redis(host=config.AWS_SERVER_IP, port=config.REDIS_DEVICES_PORT, password=config.REDIS_PASSWORD, decode_responses=True)
    for key in r.keys():
        if r.hget(key, 'router_mac') == router_mac:
            config.registered_devices[key] = r.hgetall(key)
    return config.registered_devices

def handle_packet(packet, network, iot_probability):
    global device_mac
    if IP not in packet:
        return
    if ipaddress.ip_address(packet[IP].src) not in network and ipaddress.ip_address(packet[IP].dst) not in network:
        return
    # if DHCP in packet and packet[DHCP].options:
    #     dhcp_fingerprint = handle_dhcp_packet(packet)
    packet_summary = PackageSummary(
        timestamp=datetime.fromtimestamp(packet.time).strftime('%Y-%m-%d %H:%M:%S'),
        direction="Tx" if ipaddress.ip_address(packet[IP].src) in network else "Rx",
        src_mac=packet[Ether].src.upper(),
        src_ip=packet[IP].src,
        dst_mac=packet[Ether].dst.upper(),
        dst_ip=packet[IP].dst,
        src_port=packet[TCP].sport if packet.haslayer(TCP) else "None",
        dst_port=packet[TCP].dport if packet.haslayer(TCP) else "None",
        protocol=packet[Ether].type,
        ip_version=packet[IP].version,
    )
    device_mac = packet_summary.src_mac if packet_summary.direction == "Tx" else packet_summary.dst_mac
    if packet.haslayer(DNS) and packet_summary.dst_port == 53:
        try:
            packet_summary.dns_query = packet[DNSQR].qname.decode("utf-8") if packet.haslayer(DNSQR) else "None" #payload(DNS).qd.0.qname
            # packet_summary.dns_answer = packet[DNSRR].rdata.decode("utf-8") if 'rdata' in packet[DNSRR] else "None"
        except Exception as e:
            # logger.error(f"Error decoding DNS data: {e}")
            send_msg(f"Error decoding DNS data: {e}")
    if (device_mac in config.registered_devices):
        is_iot = int(config.registered_devices[device_mac].get("is_iot"))
        if is_iot <= iot_probability:
            # logger.info(f"Device {packet_summary.src_mac} is not an IoT device (IoT probability: {is_iot}%)")
            return
    else:
        if (device_mac not in new_devices.keys() and device_mac not in config.total_new_devices.keys()):
            new_devices[device_mac] = NewDevice(**packet_summary.__dict__,
                                        ttl=packet[IP].ttl,
                                        tcp_window_size=packet[TCP].window if packet.haslayer(TCP) else 0,
                                        router_mac=router_mac)
    log_packet(packet_summary)      

def log_packet(packet_summary):
    try:
        if device_mac in packets_to_send.keys():
            tempSet = packets_to_send[device_mac]
            for existing_packet in tempSet:
                if existing_packet['dst_mac'] == packet_summary.dst_mac:
                    if existing_packet['dst_ip'] == packet_summary.dst_ip:
                        if existing_packet['dst_port'] == packet_summary.dst_port:
                            return
            packets_to_send[device_mac].append(packet_summary.__dict__)
        else:
            packets_to_send[device_mac] = [packet_summary.__dict__]
        # logger.info(f'{packet_summary.src_mac} : {packet_summary.dst_mac} : {packet_summary.direction} : {packet_summary.dst_ip} : {packet_summary.dst_port}')
        send_msg(f'{packet_summary.src_mac} : {packet_summary.dst_mac} : {packet_summary.direction} : {packet_summary.dst_ip} : {packet_summary.dst_port}')
    except Exception as e:
        # logger.error(f"Error logging packet: {e}")
        send_msg(f"Error logging packet: {e}")

def handle_sending_packets(ports_scan, os_detect, collect_data_time):
    # logger.info("Collecting data on new devices")
    send_msg("Collecting data on new devices")
    global router_mac
    for key, value in new_devices.items():
        host_name = get_hostname_from_ip(value.src_ip)
        vendor_name = get_vendor_name(value.src_ip, key)
        port_scan_result = scan_port(value.src_ip) if ports_scan else "None"
        device_os = detect_os_slow(value.src_ip) if os_detect else value.os
        new_devices[key] = {**new_devices[key].__dict__,
            'vendor': vendor_name,
            'host_name': host_name,
            'port_scan_result': port_scan_result,
            'os': device_os,
        }
    msg = ProduceMessage(router_mac=router_mac, collect_data_time=collect_data_time, new_devices=new_devices, packets=packets_to_send)
    # logger.info(f"Sending {len(new_devices)} new devices to AI Agent")
    send_msg(f"Sending {len(new_devices)} new devices to AI Agent")
    produce_message(msg)
    new_devices_sent_to_ai.update(new_devices)
      
def get_vendor_name(ip, mac):
    nm = nmap.PortScanner()
    try:
        nm.scan(hosts=ip, arguments='-sP')
        if mac not in nm[ip]['vendor'].keys():
            return "Unknown Vendor"
        else:
            vendor_name = nm[ip]['vendor'][mac]
            return vendor_name
    except Exception as e:
        logger.error(f"Error occurred while scanning: {e}")
        return "Unknown Vendor"

def get_hostname_from_ip(ip):
    try:  
        hostname, _, _ = socket.gethostbyaddr(ip)      
        return hostname
    except socket.herror:
        return "Unknown Hostname"
    
def scan_port(host):
    open_ports = ''
    # logger.info(f"Scanning ports on {host}...")
    send_msg(f"Scanning ports on {host}...")
    try: 
        for port in config.PORTS_TO_SCAN:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.1)
            result = sock.connect_ex((host, port))
            if result == 0:
                open_ports += f"{port}: open, " 
            elif result == 10013:  # Connection refused
                open_ports += f"{port}: open but permission denied, "
            elif result == 10048:  # Address already in use
                open_ports += f"{port}: Address already in use, "
            elif result == 10054:  # Connection reset by peer
                open_ports += f"{port}: Connection reset by peer, "
            elif result == 10056:  # Port is already in use
                open_ports += f"{port}: already in use, "
            elif result == 10061:  # The target machine actively refused it
                open_ports += f"{port}: machine actively refused it, "
        # try:
        #     r_http = requests.get(f"http://{host}/")
        #     if r_http.status_code == 200:
        #         open_ports += 'HTTP: service is running, '
        #     r_https = requests.get(f"https://{host}/")
        #     if r_https.status_code == 200:
        #         open_ports += 'HTTPS: service is running, '
        # except requests.RequestException:
        #     open_ports += 'HTTPS: rejected by host, '
        #     return open_ports.strip(', ')
        return open_ports.strip(', ')
    except socket.error as e:
        # logger.error(f"Socket error: {e}")
        send_msg(f"Socket error: {e}")

def detect_os_fast(packet, tcp_window_size):
    if packet:
        if packet.payload.ttl <= 80 and tcp_window_size > 64000:
            return "Linux_Unix"
        elif packet.payload.ttl <= 140 and tcp_window_size > 64000:
            return "Windows"
        elif packet.payload.ttl <= 255 and tcp_window_size < 17000:
            return "Cisco_Solaris"
        else:
            return "Unknown OS"
        
def detect_os_slow(ip):
    nm = nmap.PortScanner()
    # logger.info(f"Detecting Operating System for {ip}...")
    send_msg(f"Detecting Operating System for {ip}...")
    try:
        scan = nm.scan(hosts=ip, arguments='-O')
        if 'osmatch' in scan['scan'][ip]:
            return scan['scan'][ip]['osmatch'][0]['name']
        else:
            return "Unknown OS"
    except Exception as e:
        # logger.error(f"Error occurred while scanning: {e}")
        send_msg(f"Error occurred while scanning: {e}")
        return "Unknown OS"