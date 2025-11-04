#!/bin/bash



# Build and start all services
docker compose up --build -d

# Wait for services to be ready
sleep 5

# Check services status
docker compose ps

# Print access URLs
echo "==================================="
echo "Services are running!"
echo "==================================="
echo "Builder Service OpenAPI: http://localh    ost/devops/api/builder-service/docs"
echo "Catalogue Service OpenAPI: http://localhost/devops/api/catalogue-service/docs"
echo "pgAdmin (Database UI): http://localhost/devops/api/pgadmin (admin@sitebuilder.com / admin)"
echo "MinIO Console: http://localhost/devops/api/minio (minioadmin / minioadmin)"
echo "==================================="

firefox http://localhost/devops/api/builder-service/docs http://localhost/devops/api/catalogue-service/docs http://localhost/devops/api/pgadmin http://localhost/devops/api/minio 