#!/bin/bash

set -e

echo "🚀 Démarrage de l'environnement PRODUCTION avec Kustomize"
echo "=========================================================="

kubectl --kubeconfig ./config apply -k ./overlays/production

echo ""
echo "⏳ Attente que les pods soient prêts..."
kubectl --kubeconfig ./config wait --for=condition=ready pod -l app=postgres -n sitebuilder-production --timeout=180s
kubectl --kubeconfig ./config wait --for=condition=ready pod -l app=minio -n sitebuilder-production --timeout=180s

echo ""
echo "✅ Vérification de la stack PRODUCTION"
echo ""
kubectl --kubeconfig ./config get pods -n sitebuilder-production
echo ""
kubectl --kubeconfig ./config get ingress -n sitebuilder-production

echo ""
echo "=========================================================="
echo "✅ PRODUCTION démarré avec succès!"
echo "   URL: http://shanify.shane-donnelly.fr/devops/shanify"
echo "=========================================================="