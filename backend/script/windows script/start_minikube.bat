@echo off
REM filepath: c:\Users\coren\Desktop\devops\Project\devops\backend\script\start_minikube.bat
REM Start minikube
minikube start

REM Enable minikube docker daemon (execute the set-commands returned by minikube)
for /f "usebackq tokens=*" %%A in (`minikube docker-env --shell cmd`) do call %%A

REM Build Docker images in minikube
docker build -t builder-service:latest .\builder-service
docker build -t catalogue-service:latest .\catalogue-service

REM Apply Kubernetes manifests
kubectl apply -f kubernetes\postgres.yaml
kubectl apply -f kubernetes\minio.yaml
kubectl apply -f kubernetes\adminer.yaml

REM Wait for database and minio to be ready
timeout /t 30 /nobreak >nul

kubectl apply -f kubernetes\builder-service.yaml
kubectl apply -f kubernetes\catalogue-service.yaml
kubectl apply -f kubernetes\nginx.yaml

REM Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all --timeout=300s

REM Get the minikube IP and nginx NodePort
for /f "usebackq tokens=*" %%I in (`minikube ip`) do set MINIKUBE_IP=%%I
for /f "usebackq tokens=*" %%P in (`kubectl get svc nginx -o jsonpath="{.spec.ports[0].nodePort}"`) do set NGINX_PORT=%%P

REM Print access URLs
echo ===================================
echo Kubernetes services are running!
echo ===================================
echo Builder Service OpenAPI Docs: http://%MINIKUBE_IP%:%NGINX_PORT%/api/builder-service/docs
echo Catalogue Service OpenAPI Docs: http://%MINIKUBE_IP%:%NGINX_PORT%/api/catalogue-service/docs
echo Adminer (Database UI): http://%MINIKUBE_IP%:%NGINX_PORT%/api/adminer
echo MinIO Console: http://%MINIKUBE_IP%:%NGINX_PORT%/api/minio
echo ===================================