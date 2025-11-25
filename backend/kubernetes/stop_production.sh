#!/bin/bash

set -e

echo "🛑 Arrêt de l'environnement PRODUCTION"
echo "======================================="

kubectl --kubeconfig ./config delete -k ./overlays/production

echo ""
echo "✅ PRODUCTION arrêté avec succès!"