from confluent_kafka import Consumer
from confluent_kafka.admin import AdminClient, NewTopic
import logging
import json
import config as config
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

KAFKA_BROKER_URL = config.KAFKA_BROKER_URL
# print(f"KAFKA_BROKER_URL: {KAFKA_BROKER_URL}")
KAFKA_TOPIC = 'reply_from_cloud'

def send_msg(msg):
    config.msg_to_client = msg
    logger.info(msg)
    
def create_topic():
    # Configuration for the Kafka Admin client
    try:
        conf = {
            'bootstrap.servers': KAFKA_BROKER_URL  # Change to your broker or Confluent Cloud bootstrap server
        }
        
        admin_client = AdminClient(conf)
        metadata = admin_client.list_topics(timeout=10)
        if KAFKA_TOPIC in metadata.topics:
            logger.info(f"Topic '{KAFKA_TOPIC}' already exists.")
            return True
        # Define new topic
        new_topic = NewTopic(
            topic=KAFKA_TOPIC,
            num_partitions=3,          # adjust as needed
            replication_factor=1       # set >1 in production cluster
        )

        # Create the topic
        fs = admin_client.create_topics([new_topic])
    
        # Wait for operation to finish
        for topic, f in fs.items():
            try:
                f.result()  # The result itself is None if successful
                logger.info(f"✅ Topic '{topic}' created successfully")
            except Exception as e:
                logger.error(f"⚠️ Failed to create topic '{topic}': {e}")
        return True
    except Exception as e:
        logger.error(f"Error checking for topic: {e}")
        return False


def consume_messages():
    if not create_topic():
        logger.error("Failed to check topics, exiting consumer.")
        return
    consumer = Consumer({
    'bootstrap.servers': KAFKA_BROKER_URL,
    'group.id': 'fastapi-group',
    # 'auto.offset.reset': 'earliest',
    })
    consumer.subscribe([KAFKA_TOPIC])
    time.sleep(3)
    send_msg("Starting to consume messages...")
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            send_msg(f"Consumer error: {msg.error()}")
            continue
        send_msg(f"\n{msg.value().decode('utf-8')}")
        # msg_dict = json.loads(msg.value().decode('utf-8'))
        # config.registered_devices.update(msg_dict)
        # with open(config.DEVICES_FILE, 'w') as file:
        #     json.dump(config.registered_devices, file, indent=4)
        # # update_devices_dict(msg_dict)
        # logger.info("\nReceived response:")
        # for device in msg_dict:
        #     logger.info(f"Device: {device}, IP: {msg_dict[device]['src_ip']}, Is IoT: {msg_dict[device]['is_iot']}")