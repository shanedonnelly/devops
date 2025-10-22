#!/bin/bash
# Build and start all services
docker compose up --build -d

# Wait for services to be ready (30-60 seconds)
sleep 5

# Check services status
docker compose ps

# Print access URLs
echo "==================================="
echo "Services are running!"
echo "==================================="
echo "Builder Service OpenAPI Docs: http://localhost/api/builder-service/docs"
echo "Catalogue Service OpenAPI Docs: http://localhost/api/catalogue-service/docs"
echo "Adminer (Database UI): http://localhost/api/adminer"
echo "MinIO Console: http://localhost/api/minio"
echo "==================================="