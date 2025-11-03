@echo off
REM filepath: devops\backend\script\launch_docker_compose.bat
REM Build and start all services
docker compose up --build -d

REM Wait for services to be ready (30-60 seconds)
timeout /t 20

REM Check services status
docker compose ps

REM Print access URLs
echo ===================================
echo Services are running!
echo ===================================
echo Builder Service OpenAPI Docs: http://localhost/api/builder-service/docs
echo Catalogue Service OpenAPI Docs: http://localhost/api/catalogue-service/docs
echo Adminer (Database UI): http://localhost/api/adminer
echo MinIO Console: http://localhost/api/minio
echo ===================================