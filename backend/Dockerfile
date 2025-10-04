FROM python:3.13.7-slim-bookworm
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y libpcap-dev && apt-get install nmap -y
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install scapy
COPY ./app ./app
EXPOSE 8000
CMD ["python", "app/main.py"]