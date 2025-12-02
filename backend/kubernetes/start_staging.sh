#!/bin/bash

set -e

echo "🚀 Démarrage de l'environnement STAGING avec Kustomize"
echo "======================================================="

# Détection automatique : si ./config existe, on l'utilise
if [ -f "./config" ]; then
    KUBECONFIG_OPT="--kubeconfig ./config"
else
    KUBECONFIG_OPT=""
fi

kubectl $KUBECONFIG_OPT apply -k ./overlays/staging

echo ""
echo "⏳ Attente que les pods soient prêts..."
kubectl $KUBECONFIG_OPT wait --for=condition=ready pod -l app=postgres -n sitebuilder-staging --timeout=180s
kubectl $KUBECONFIG_OPT wait --for=condition=ready pod -l app=minio -n sitebuilder-staging --timeout=180s

echo ""
echo "✅ Vérification de la stack STAGING"
echo ""
kubectl $KUBECONFIG_OPT get pods -n sitebuilder-staging
echo ""
kubectl $KUBECONFIG_OPT get ingress -n sitebuilder-staging
echo ""
cat <<'TUTO'
# Voir les pods et leur statut
kubectl $KUBECONFIG_OPT get pods -n sitebuilder-staging

# Voir les services et ingresses
kubectl $KUBECONFIG_OPT get svc -n sitebuilder-staging
kubectl $KUBECONFIG_OPT get ingress -n sitebuilder-staging

# Logs (remplacer <pod-name> par le nom réel)
kubectl $KUBECONFIG_OPT logs -n sitebuilder-staging <pod-name> --tail=200
kubectl $KUBECONFIG_OPT logs -n sitebuilder-staging <pod-name> -f    # suivre en direct
TUTO
echo ""
echo "======================================================="
echo "✅ STAGING démarré avec succès!"
echo "   URL: https://shanify-test.shane-donnelly.fr/devops/shanify"
echo "======================================================="