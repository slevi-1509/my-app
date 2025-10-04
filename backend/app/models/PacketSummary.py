class PackageSummary:
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
                dns_query: str = "None",
                dns_answer: str = "None",
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
        self.dns_query = dns_query
        self.dns_answer = dns_answer