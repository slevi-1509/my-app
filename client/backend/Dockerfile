FROM python:3.13.7-slim-bookworm
RUN apt-get update && apt-get install -y libpcap-dev nmap iputils-ping tcpdump iproute2 net-tools
WORKDIR /app
COPY . .
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
# CMD ["uvicorn", "app/main:app", "--host", "0.0.0.0", "--port", "8000"]
CMD ["python", "app/main.py"]