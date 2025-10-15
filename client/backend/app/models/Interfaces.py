from pydantic import BaseModel

class InterfaceClass(BaseModel):
    interface: str
    ip: str
    mac: str