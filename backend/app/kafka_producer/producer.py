from confluent_kafka import Producer
from kafka_producer.produce_schema import ProduceMessage
import json
import config

KAFKA_BROKER_URL = config.KAFKA_BROKER_URL
KAFKA_TOPIC = 'local_server_to_dispatcher'
PRODUCER_CLIENT_ID = 'fastapi_producer'

def send_message(message: ProduceMessage):
    value = message.model_dump_json().encode('utf-8')
    producer = Producer({'bootstrap.servers': KAFKA_BROKER_URL})
    producer.produce(KAFKA_TOPIC, key=config.OPEN_AI_KEY, value=value)
    print(f"\nMessage sent to topic {KAFKA_TOPIC}\n")
    producer.flush()