#!/bin/bash

set -e

echo "🚀 Démarrage de la stack Kubernetes sur Minikube"
echo "================================================"

# Configuration de base
echo ""
echo "📦 Étape 1 - Configuration de base"
kubectl apply -f ./base/namespace.yaml
kubectl apply -f ./base/configmap.yaml
kubectl apply -f ./base/secrets.yaml

# Base de données et stockage
echo ""
echo "🗄️ Étape 2 - Base de données et stockage"
kubectl apply -f ./postgres/pvc.yaml
kubectl apply -f ./postgres/deployment.yaml
kubectl apply -f ./postgres/service.yaml

kubectl apply -f ./pgadmin/pvc.yaml
kubectl apply -f ./pgadmin/deployment.yaml
kubectl apply -f ./pgadmin/service.yaml

kubectl apply -f ./minio/pvc.yaml
kubectl apply -f ./minio/deployment.yaml
kubectl apply -f ./minio/service.yaml

echo ""
echo "⏳ Attente que Postgres soit prêt..."
kubectl wait --for=condition=ready pod -l app=postgres -n sitebuilder --timeout=180s

echo ""
echo "⏳ Attente que MinIO soit prêt..."
kubectl wait --for=condition=ready pod -l app=minio -n sitebuilder --timeout=180s

# Services applicatifs
echo ""
echo "⚙️ Étape 3 - Services applicatifs"
kubectl apply -f ./builder-service/deployment.yaml
kubectl apply -f ./builder-service/service.yaml

kubectl apply -f ./catalogue-service/deployment.yaml
kubectl apply -f ./catalogue-service/service.yaml

kubectl apply -f ./chatbot-service/deployment.yaml
kubectl apply -f ./chatbot-service/service.yaml

# Point d'entrée
echo ""
echo "🌐 Étape 4 - Point d'entrée Nginx"
kubectl apply -f ./nginx/deployment.yaml
kubectl apply -f ./nginx/service.yaml

# Vérification
echo ""
echo "✅ Vérification de la stack"
echo ""
echo "Pods:"
kubectl get pods -n sitebuilder
echo ""
echo "Services:"
kubectl get services -n sitebuilder

echo ""
echo "================================================"
echo "✅ Stack démarrée avec succès!"
echo ""
echo "Pour accéder à l'application, lancez dans un autre terminal:"
echo "  minikube tunnel"
echo ""
echo "Puis accédez à: http://127.0.0.1/devops/shanify"
echo "================================================"