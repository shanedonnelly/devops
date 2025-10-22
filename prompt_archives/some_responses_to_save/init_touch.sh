# Create directory structure
mkdir -p backend/builder-service backend/catalogue-service backend/kubernetes

# Create backend files
touch backend/.gitignore \
  backend/docker-compose.yaml \
  backend/builder-service/app.py \
  backend/builder-service/models.py \
  backend/builder-service/requirements.txt \
  backend/builder-service/Dockerfile \
  backend/builder-service/schema.prisma \
  backend/catalogue-service/app.py \
  backend/catalogue-service/models.py \
  backend/catalogue-service/requirements.txt \
  backend/catalogue-service/Dockerfile \
  backend/catalogue-service/schema.prisma \
  backend/kubernetes/postgres.yaml \
  backend/kubernetes/minio.yaml \
  backend/kubernetes/adminer.yaml \
  backend/kubernetes/builder-service.yaml \
  backend/kubernetes/catalogue-service.yaml \
  backend/kubernetes/nginx.yaml