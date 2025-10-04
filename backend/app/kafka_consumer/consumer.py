from confluent_kafka import Consumer
from confluent_kafka.admin import AdminClient, NewTopic
import json
import config
import time

KAFKA_BROKER_URL = config.KAFKA_BROKER_URL
print(f"KAFKA_BROKER_URL: {KAFKA_BROKER_URL}")
KAFKA_TOPIC = 'reply_from_ai_request'

def create_topic():
    # Configuration for the Kafka Admin client
    try:
        conf = {
            'bootstrap.servers': KAFKA_BROKER_URL  # Change to your broker or Confluent Cloud bootstrap server
        }
        
        admin_client = AdminClient(conf)
        metadata = admin_client.list_topics(timeout=10)
        if KAFKA_TOPIC in metadata.topics:
            print(f"Topic '{KAFKA_TOPIC}' already exists.")
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
                print(f"✅ Topic '{topic}' created successfully")
            except Exception as e:
                print(f"⚠️ Failed to create topic '{topic}': {e}")
        return True
    except Exception as e:
        print(f"Error checking for topic: {e}")
        return False


def consume_messages():
    if not create_topic():
        print("Failed to check topics, exiting consumer.")
        return
    consumer = Consumer({
    'bootstrap.servers': KAFKA_BROKER_URL,
    'group.id': 'fastapi-group',
    # 'auto.offset.reset': 'earliest',
    })
    consumer.subscribe([KAFKA_TOPIC])
    time.sleep(3)
    print("Starting to consume messages...")
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print(f"Consumer error: {msg.error()}")
            continue
        msg_dict = json.loads(msg.value().decode('utf-8'))
        config.registered_devices.update(msg_dict)
        with open(config.DEVICES_FILE, 'w') as file:
            json.dump(config.registered_devices, file, indent=4)
        # update_devices_dict(msg_dict)
        print("\nReceived response:")
        for device in msg_dict:
            print(f"Device: {device}, IP: {msg_dict[device]['src_ip']}, Is IoT: {msg_dict[device]['is_iot']}")

# def update_devices_dict(new_devices_results):
#     config.registered_devices = new_devices_results
#     for device in new_devices_results:
#         if device in config.total_new_devices:
#             del config.total_new_devices[device]