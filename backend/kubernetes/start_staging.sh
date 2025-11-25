#!/bin/bash

set -e

echo "🚀 Démarrage de l'environnement STAGING avec Kustomize"
echo "======================================================="

kubectl --kubeconfig ./config apply -k ./overlays/staging

echo ""
echo "⏳ Attente que les pods soient prêts..."
kubectl --kubeconfig ./config wait --for=condition=ready pod -l app=postgres -n sitebuilder-staging --timeout=180s
kubectl --kubeconfig ./config wait --for=condition=ready pod -l app=minio -n sitebuilder-staging --timeout=180s

echo ""
echo "✅ Vérification de la stack STAGING"
echo ""
kubectl --kubeconfig ./config get pods -n sitebuilder-staging
echo ""
kubectl --kubeconfig ./config get ingress -n sitebuilder-staging

echo ""
echo "======================================================="
echo "✅ STAGING démarré avec succès!"
echo "   URL: https://shanify-test.shane-donnelly.fr/devops/shanify"
echo "======================================================="