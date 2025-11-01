from confluent_kafka import Producer
import json
import os
import logging
from kafka_producer.produce_schema import ProduceMessage
import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
KAFKA_BROKER_URL = os.environ.get('KAFKA_BROKER_URL', config.KAFKA_BROKER_URL)
# KAFKA_BROKER_URL = "kafka:29092"
logger.info(f"KAFKA_BROKER_URL: {KAFKA_BROKER_URL}")
KAFKA_TOPIC = 'reply_from_cloud'

def send_message():
    producer = Producer({'bootstrap.servers': KAFKA_BROKER_URL})
    producer.produce(KAFKA_TOPIC, key='message', value="Packets Agent processing completed")
    logger.info(f"\nMessage sent to topic {KAFKA_TOPIC}: Packets Agent processing completed")
    producer.flush()