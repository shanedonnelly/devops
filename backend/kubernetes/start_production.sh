#!/bin/bash

set -e

echo "🚀 Démarrage de l'environnement PRODUCTION avec Kustomize"
echo "=========================================================="

# Détection automatique : si ./config existe, on l'utilise
if [ -f "./config" ]; then
    KUBECONFIG_OPT="--kubeconfig ./config"
else
    KUBECONFIG_OPT=""
fi

kubectl $KUBECONFIG_OPT apply -k ./overlays/production

echo ""
echo "⏳ Attente que les pods soient prêts..."
kubectl $KUBECONFIG_OPT wait --for=condition=ready pod -l app=postgres -n sitebuilder-production --timeout=180s
kubectl $KUBECONFIG_OPT wait --for=condition=ready pod -l app=minio -n sitebuilder-production --timeout=180s

echo ""
echo "✅ Vérification de la stack PRODUCTION"
echo ""
kubectl $KUBECONFIG_OPT get pods -n sitebuilder-production
echo ""
kubectl $KUBECONFIG_OPT get ingress -n sitebuilder-production
echo ""
cat <<'TUTO'
# Voir les pods et leur statut
kubectl $KUBECONFIG_OPT get pods -n sitebuilder-production

# Voir les services et ingresses
kubectl $KUBECONFIG_OPT get svc -n sitebuilder-production
kubectl $KUBECONFIG_OPT get ingress -n sitebuilder-production

# Logs (remplacer <pod-name> par le nom réel)
kubectl $KUBECONFIG_OPT logs -n sitebuilder-production <pod-name> --tail=200
kubectl $KUBECONFIG_OPT logs -n sitebuilder-production <pod-name> -f    # suivre en direct
TUTO
echo ""
echo "=========================================================="
echo "✅ PRODUCTION démarré avec succès!"
echo "   URL: https://shanify.shane-donnelly.fr/devops/shanify"
echo "   pgAdmin: https://shanify.shane-donnelly.fr/devops/api/pgadmin"
echo "   MinIO: https://minio-prod.shane-donnelly.fr"
echo "=========================================================="