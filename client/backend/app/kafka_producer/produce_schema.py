from pydantic import BaseModel
from typing import Dict, Any

class ProduceMessage(BaseModel):
    router_mac: str
    collect_data_time: int
    new_devices: Dict[str, Any]
    packets: Dict[str, Any]