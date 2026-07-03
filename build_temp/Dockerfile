FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    wrenai==0.11.0 \
    requests

WORKDIR /app

# 将脚本拷贝到镜像中
COPY list_models.py /app/

CMD ["sleep", "infinity"]
