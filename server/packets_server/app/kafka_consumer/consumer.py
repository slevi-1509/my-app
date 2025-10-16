from confluent_kafka import Consumer, KafkaError
from confluent_kafka.admin import AdminClient, NewTopic
from datetime import datetime
import os
import logging
import redis
import json
import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
KAFKA_BROKER_URL = os.environ.get('KAFKA_BROKER_URL', config.KAFKA_BROKER_URL)
# KAFKA_BROKER_URL = "kafka:29092"
logger.info(f"KAFKA_BROKER_URL: {KAFKA_BROKER_URL}")
KAFKA_TOPIC = 'dispatcher_to_packets_server'

def create_topic():
    # Configuration for the Kafka Admin client
    conf = {
        'bootstrap.servers': KAFKA_BROKER_URL  # Change to your broker or Confluent Cloud bootstrap server
    }
    admin_client = AdminClient(conf)
    metadata = admin_client.list_topics(timeout=10)
    if KAFKA_TOPIC in metadata.topics:
        logger.warning(f"Topic '{KAFKA_TOPIC}' already exists.")
        return
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


def consume_messages():
    create_topic()
    consumer = Consumer({
    'bootstrap.servers': KAFKA_BROKER_URL,
    # 'enable.auto.commit': True,       # manual commit
    # 'auto.offset.reset': 'earliest',
    'group.id': 'fastapi-group',
    # 'max.poll.interval.ms': 600000,    # 10 minutes (optional tuning)
    # 'session.timeout.ms': 45000
    })
    consumer.subscribe([KAFKA_TOPIC])
    # time.sleep(3)
    logger.info("Starting to consume messages...")
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                logger.error(f"Error: {msg.error()}")
                continue
        msg_value = json.loads(msg.value().decode('utf-8'))
        msg_key = int(msg.key().decode('utf-8'))
        logger.info(f"{datetime.now().strftime('%H:%M:%S - %Y-%m-%d')} - Received message")
        connect_redis(msg_key, msg_value)

def connect_redis(collect_data_time, packets):
    r = redis.Redis(host='redis-log', port=6379, password=config.REDIS_PASSWORD, decode_responses=True)
    for key, value in packets.items():
        if not r.exists(key):
            r.rpush(key, *map(json.dumps, value))
            logger.info(f"Key {key} created with {len(value)} packets")
            continue
        mac_packets = {}
        format_string = "%Y-%m-%d %H:%M:%S"
        for index,(item) in enumerate(r.lrange(key, 0, -1)):    # get all existing packets for the device mac (key)
            item = json.loads(item)
            if index==0:
                first_packet_time = datetime.strptime(item['timestamp'], format_string)
            mac_packets[item['dst_mac'] + item['dst_ip'] + str(item['dst_port'])] = item
        for item in value:
            if item['dst_mac'] + item['dst_ip'] + str(item['dst_port']) in mac_packets:
                continue
            else:
                curr_packet_time = datetime.strptime(item['timestamp'], format_string)
                time_diff_sec = (curr_packet_time - first_packet_time).total_seconds()
                if time_diff_sec > collect_data_time:
                    handle_anomaly(item, key)
                r.rpush(key, json.dumps(item))
                logger.info(f"New packet added to {key}")
                
def handle_anomaly(packet, mac):
    logger.warning(f"Anomaly detected: {packet}")
    r = redis.Redis(host='redis-anomalies', port=6379, password=config.REDIS_PASSWORD, decode_responses=True)
    r.rpush(mac, json.dumps(packet))