#!/bin/bash

set -e

echo "🛑 Arrêt de l'environnement STAGING"
echo "===================================="

kubectl --kubeconfig ./config delete -k ./overlays/staging

echo ""
echo "✅ STAGING arrêté avec succès!"