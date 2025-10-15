from confluent_kafka import Consumer, KafkaError
from confluent_kafka.admin import AdminClient, NewTopic
from datetime import datetime
import json
import threading
import os
import logging
import config
from kafka_producer.producer import send_message

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
KAFKA_BROKER_URL = os.environ.get('KAFKA_BROKER_URL', config.KAFKA_BROKER_URL)
# KAFKA_BROKER_URL = "kafka:29092"
logger.info(f"KAFKA_BROKER_URL: {KAFKA_BROKER_URL}")
KAFKA_TOPIC = 'local_server_to_dispatcher'

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
        msg_key = msg.key().decode('utf-8')
        msg_value = json.loads(msg.value().decode('utf-8'))
        # msg_data = {collect_data_time: msg_value.get('collect_data_time', None), msg_value['data']
        # msg_data = {'collect_data_time': msg_value.get('collect_data_time', None), 'data': msg_value['data']}
        logger.info(f"\n{datetime.now().strftime('%H:%M:%S - %Y-%m-%d')} - Received message\n")
        thread = threading.Thread(target=handle_message, args=(msg_key, msg_value, )) #data_queue))
        thread.start()
        thread.join()
        # handle_message(msg_key, msg_value)
        
        # data_queue = queue.Queue()
        # thread = threading.Thread(target=get_openai_response, args=(msg_key, msg_value, )) #data_queue))
        # thread.start()
        # thread.join()
        # if not data_queue.empty():
        #     thread = threading.Thread(target=send_message, args=(data_queue.get(), ))
        #     thread.start()
        #     thread.join()
        #     for device in data_queue.get():
        #         print(f"Device: {device}, Data: {data_queue.get()[device]}")
        
def handle_message(msg_key, msg_value):
    # r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    print("new devices:", msg_value['new_devices'])
    if msg_value['new_devices']:
        # for key in msg_value['new_devices']:
        #     if r.exists(key):
        #         del msg_value['new_devices'][key]
        send_message('dispatcher_to_ai_agent', msg_value['new_devices'], msg_key)
        logger.info("New devices found and sent to AI agent")
    else:
        logger.info("No new devices found")
    send_message('dispatcher_to_packets_server', msg_value['packets'], str(msg_value['collect_data_time']))
    logger.info("Message sent to packets server")
    