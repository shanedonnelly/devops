#!/bin/bash

set -e

echo "🛑 Arrêt de la stack Kubernetes sur Minikube"
echo "=============================================="

echo ""
echo "Suppression du namespace sitebuilder (et toutes les ressources)..."
kubectl --kubeconfig ./config delete namespace sitebuilder

echo ""
echo "=============================================="
echo "✅ Stack arrêtée avec succès!"
echo ""
echo "Note: Si 'minikube tunnel' est en cours, arrêtez-le avec Ctrl+C"
echo "=============================================="