@echo off
REM filepath: c:\Users\coren\Desktop\devops\Project\devops\backend\script\some_logs.bat
docker compose logs -f builder-service
docker compose logs -f catalogue-service
kubectl logs -f deployment/builder-service
kubectl logs -f deployment/catalogue-service