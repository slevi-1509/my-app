from confluent_kafka import Producer
from kafka_producer.produce_schema import ProduceMessage
import os
import logging
import config as config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

KAFKA_BROKER_URL = config.KAFKA_BROKER_URL
KAFKA_TOPIC = 'local_server_to_dispatcher'
PRODUCER_CLIENT_ID = 'fastapi_producer'
OPEN_AI_KEY = os.environ.get('OPEN_AI_KEY', config.OPEN_AI_KEY)

def send_message(message: ProduceMessage):
    value = message.model_dump_json().encode('utf-8')
    producer = Producer({'bootstrap.servers': KAFKA_BROKER_URL})
    producer.produce(KAFKA_TOPIC, key=OPEN_AI_KEY, value=value)
    logger.info(f"Message sent to topic {KAFKA_TOPIC}")
    producer.flush()