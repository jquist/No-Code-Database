FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
  curl \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# Ensure entrypoint uses Unix line endings inside the image (fixes Windows CRLF issues)
RUN sed -i 's/\r$//' /entrypoint.sh || true

EXPOSE 6060

ENTRYPOINT ["/entrypoint.sh"]
# Default command: run the development server (change for prod)
CMD ["python", "manage.py", "runserver", "0.0.0.0:6060"]