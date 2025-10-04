from pydantic import BaseModel, Field

class ProduceMessage(BaseModel):
    message: dict = Field(default_factory=dict)