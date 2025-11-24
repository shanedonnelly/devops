#!/bin/bash

set -e

echo "🚀 Démarrage de la stack Kubernetes sur le cluster K3s"
echo "======================================================="

# Configuration de base
echo ""
echo "📦 Étape 1 - Configuration de base"
kubectl --kubeconfig ./config apply -f ./base/namespace.yaml
kubectl --kubeconfig ./config apply -f ./base/configmap.yaml
kubectl --kubeconfig ./config apply -f ./base/secrets.yaml

# Base de données et stockage
echo ""
echo "🗄️ Étape 2 - Base de données et stockage"
kubectl --kubeconfig ./config apply -f ./postgres/pvc.yaml
kubectl --kubeconfig ./config apply -f ./postgres/deployment.yaml
kubectl --kubeconfig ./config apply -f ./postgres/service.yaml

kubectl --kubeconfig ./config apply -f ./pgadmin/pvc.yaml
kubectl --kubeconfig ./config apply -f ./pgadmin/deployment.yaml
kubectl --kubeconfig ./config apply -f ./pgadmin/service.yaml

kubectl --kubeconfig ./config apply -f ./minio/pvc.yaml
kubectl --kubeconfig ./config apply -f ./minio/deployment.yaml
kubectl --kubeconfig ./config apply -f ./minio/service.yaml

echo ""
echo "⏳ Attente que Postgres soit prêt..."
kubectl --kubeconfig ./config wait --for=condition=ready pod -l app=postgres -n sitebuilder --timeout=180s

echo ""
echo "⏳ Attente que MinIO soit prêt..."
kubectl --kubeconfig ./config wait --for=condition=ready pod -l app=minio -n sitebuilder --timeout=180s

# Services applicatifs
echo ""
echo "⚙️ Étape 3 - Services applicatifs"
kubectl --kubeconfig ./config apply -f ./builder-service/deployment.yaml
kubectl --kubeconfig ./config apply -f ./builder-service/service.yaml

kubectl --kubeconfig ./config apply -f ./catalogue-service/deployment.yaml
kubectl --kubeconfig ./config apply -f ./catalogue-service/service.yaml

kubectl --kubeconfig ./config apply -f ./chatbot-service/deployment.yaml
kubectl --kubeconfig ./config apply -f ./chatbot-service/service.yaml

# Point d'entrée
echo ""
echo "🌐 Étape 4 - Point d'entrée Nginx + Ingress"
kubectl --kubeconfig ./config apply -f ./nginx/deployment.yaml
kubectl --kubeconfig ./config apply -f ./nginx/service.yaml
kubectl --kubeconfig ./config apply -f ./nginx/ingress.yaml

# Vérification
echo ""
echo "✅ Vérification de la stack"
echo ""
echo "Pods:"
kubectl --kubeconfig ./config get pods -n sitebuilder
echo ""
echo "Services:"
kubectl --kubeconfig ./config get services -n sitebuilder
echo ""
echo "Ingress:"
kubectl --kubeconfig ./config get ingress -n sitebuilder

echo ""
echo "======================================================="
echo "✅ Stack démarrée avec succès!"
echo ""
echo "Accès à l'application:"
echo "  - Par IP: http://37.59.108.243/"
echo "  - Par hostname: http://sitebuilder.local/ (ajoutez '37.59.108.243 sitebuilder.local' à /etc/hosts)"
echo ""
echo "Documentation des APIs:"
echo "  - Builder Service: http://37.59.108.243/api/builder-service/docs"
echo "  - Catalogue Service: http://37.59.108.243/api/catalogue-service/docs"
echo "======================================================="