#!/bin/bash
# Start minikube
minikube start

# Enable minikube docker daemon
eval $(minikube docker-env)

# Build Docker images in minikube
docker build -t builder-service:latest ./builder-service
docker build -t catalogue-service:latest ./catalogue-service

# Apply Kubernetes manifests
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/minio.yaml
kubectl apply -f kubernetes/adminer.yaml

# Wait for database and minio to be ready
sleep 30

kubectl apply -f kubernetes/builder-service.yaml
kubectl apply -f kubernetes/catalogue-service.yaml
kubectl apply -f kubernetes/nginx.yaml

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all --timeout=300s

# Get the minikube IP and nginx NodePort
MINIKUBE_IP=$(minikube ip)
NGINX_PORT=$(kubectl get svc nginx -o jsonpath='{.spec.ports[0].nodePort}')

# Print access URLs
echo "==================================="
echo "Kubernetes services are running!"
echo "==================================="
echo "Builder Service OpenAPI Docs: http://${MINIKUBE_IP}:${NGINX_PORT}/api/builder-service/docs"
echo "Catalogue Service OpenAPI Docs: http://${MINIKUBE_IP}:${NGINX_PORT}/api/catalogue-service/docs"
echo "Adminer (Database UI): http://${MINIKUBE_IP}:${NGINX_PORT}/api/adminer"
echo "MinIO Console: http://${MINIKUBE_IP}:${NGINX_PORT}/api/minio"
echo "==================================="