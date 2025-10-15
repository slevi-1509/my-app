FROM python:3.13.1-slim
WORKDIR /app
COPY ./app ./app
RUN pip install -r app/requirements.txt
CMD ["python", "app/main.py"]