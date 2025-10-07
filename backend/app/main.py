import uvicorn
from fastapi import FastAPI
from scapy import interfaces
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import StreamingResponse
import threading
from routes import routers
from kafka_consumer.consumer import consume_messages
import config

app = FastAPI(title="Sniffer API", version="1.0.0", 
              description="API for Sniffer application")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router)
status_message = ""

def get_interfaces():
    found_working_interfaces = interfaces.get_working_ifaces()
    for interface in found_working_interfaces:
        if interface.ip != '':
            config.active_interfaces.append({'interface': interface.name, 'ip': interface.ip, 'mac': interface.mac.upper()})
    return config.active_interfaces

def main():
    get_interfaces()
    thread = threading.Thread(target=consume_messages)
    thread.start()
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
    thread.join()

if __name__ == "__main__":
    main()
