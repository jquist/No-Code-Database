# 1. Start with an official Python base image
FROM python:3.10-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Install dependencies
COPY requirements.txt .

RUN pip install -r requirements.txt

# 5. Copy project code into the container
COPY . .

# 6. Expose the port
EXPOSE 5050

# 7. Define the command to run app
CMD ["python", "manage.py", "runserver", "0.0.0.0:5050"]