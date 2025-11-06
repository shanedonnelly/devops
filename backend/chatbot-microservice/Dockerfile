# 1. Use an official Python runtime as a parent image
FROM python:3.10-slim

# 2. Set the working directory in the container
WORKDIR /code

# 3. Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 4. Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 5. Copy the application code into the container
COPY ./app /code/app
COPY ./front /code/app/front

# 6. Expose the port the app runs on
EXPOSE 8000

# 7. Define the command to run your app
# The MISTRAL_API_KEY will be injected by Kubernetes, not here.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]