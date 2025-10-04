from confluent_kafka import Producer
import json
import os
import logging
import config
from kafka_producer.produce_schema import ProduceMessage

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

KAFKA_BROKER_URL = os.environ.get('KAFKA_BROKER_URL', config.KAFKA_BROKER_URL)
# KAFKA_BROKER_URL = "kafka:29092"
logger.info(f"KAFKA_BROKER_URL: {KAFKA_BROKER_URL}")

def send_message(topic, message: ProduceMessage, key=None):
    producer = Producer({'bootstrap.servers': KAFKA_BROKER_URL})
    msg = json.dumps(message)
    producer.produce(topic, key=key, value=msg)
    logger.info(f"\nMessage sent to topic {topic}:\n")
    producer.flush()