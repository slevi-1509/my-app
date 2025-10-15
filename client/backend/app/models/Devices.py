from pydantic import BaseModel

class Device(BaseModel):
    src_ip: str
    src_mac: str
    vendor: str
    host_name: str
    port_scan_result: str
    os: str
    ttl: int
    tcp_window_size: int
    is_iot: str
    iot_reasoning: str