@echo off

rem Build and start all services
docker compose up --build -d

rem Wait for services to be ready
timeout /t 5 /nobreak >nul

rem Check services status
docker compose ps

rem Print access URLs
echo ===================================
echo Services are running!
echo ===================================
echo Builder Service OpenAPI: http://localhost/devops/api/builder-service/docs
echo Catalogue Service OpenAPI: http://localhost/devops/api/catalogue-service/docs
echo pgAdmin (Database UI): http://localhost/devops/api/pgadmin (admin@sitebuilder.com / admin)
echo MinIO Console: http://localhost/devops/api/minio (minioadmin / minioadmin)
echo MinIO API: http://localhost/devops/api/minio-api
echo ===================================
pause