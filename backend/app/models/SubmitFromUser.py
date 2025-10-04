from pydantic import BaseModel

class SubmitFromUser(BaseModel):
    interval: int
    no_of_packets: int 
    no_of_sessions: int
    collect_data_time: int
    iot_probability: int
    ports_scan: bool
    os_detect: bool
    interface: str