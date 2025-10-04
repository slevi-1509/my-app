from openai import OpenAI
import logging
import redis

def get_openai_response(api_key, new_devices: dict): #, data_queue: queue.Queue):
    devices_to_register = {}
    for key, value in new_devices.items():
        # Format device info into prompt
        prompt = f"""
        Given the following device information from a local network, determine if it is likely an IoT device:

        Device Info:
        - IP: {value['src_ip']}
        - Packet Direction: {value['direction']}
        - MAC: {value['src_mac']}
        - Vendor: {value['vendor']}
        - Hostname: {value['host_name']}
        - Detected Operating System: {value['os']}
        - Destination MAC Address: {value['dst_mac']}
        - Destination IP Address: {value['dst_ip']}
        - Destination Port: {value['dst_port']}
        - Source Port: {value['src_port']}
        - TTL: {value['ttl']}
        - TCP Window Size: {value['tcp_window_size']}
        - Ports and Services with scan status: {value['port_scan_result']}

        Is this device likely an IoT device?
        return a percentage number as an integer of probability that it is an IoT device and a short explanation
        (up to 500 characters) of the reasoning behind the probability result (separated by ::).
        """
        
        client = OpenAI(
            api_key=api_key,
        )
        
        try:
            response = client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ]
            )
        except Exception as e:
            logging.error(f"OpenAI API error: {e}")
            return "Error in OpenAI API request"
        try:
            is_iot = int(response.choices[0].message.content.split('::')[0].strip().replace('%', ''))
        except ValueError:
            is_iot = 0

        iot_reasoning = (response.choices[0].message.content.split('::')[1].strip())
        devices_to_register[value['src_mac']] = {
            "timestamp": value['timestamp'],
            "src_ip": value['src_ip'],
            "src_mac": value['src_mac'],
            "vendor": value['vendor'],
            "host_name": value['host_name'],
            "port_scan_result": value['port_scan_result'],
            "os": value['os'],
            "ttl": value['ttl'],
            "tcp_window_size": value['tcp_window_size'],
            "is_iot": is_iot,
            "iot_reasoning": iot_reasoning,
            "router_mac": value['router_mac']
        }
    if len(devices_to_register) > 0:
        connect_redis(devices_to_register)

def connect_redis(devices_to_register):
    r = redis.Redis(host='redis-devices', port=6379, decode_responses=True)
    for key, value in devices_to_register.items():
        r.hset(key, mapping=value)