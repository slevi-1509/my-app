class NewDevice:
    def __init__(
                self, 
                timestamp: str,
                direction: str,
                src_mac: str, 
                src_ip: str, 
                dst_mac: str, 
                dst_ip: str, 
                src_port: int,
                dst_port: int, 
                protocol: int,
                ip_version: int, 
                ttl: int = 0,
                tcp_window_size: int = 0,
                is_iot: int = 0,
                dns_query: str = "None",
                dns_answer: str = "None",
                os: str = "None",
                vendor: str = "None",
                host_name: str = "None",
                port_scan_result: str = "None",
                router_mac: str = "None"
        ):
        
        self.timestamp = timestamp
        self.direction = direction
        self.src_mac = src_mac
        self.src_ip = src_ip
        self.dst_mac = dst_mac
        self.dst_ip = dst_ip
        self.src_port = src_port
        self.dst_port = dst_port
        self.protocol = protocol
        self.ip_version = ip_version
        self.ttl = ttl
        self.tcp_window_size = tcp_window_size
        self.is_iot = is_iot
        self.dns_query = dns_query
        self.dns_answer = dns_answer
        self.os = os
        self.vendor = vendor
        self.host_name = host_name
        self.port_scan_result = port_scan_result
        self.router_mac = router_mac