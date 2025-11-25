Read terminal selection

# Étapes de déploiement avec Minikube

## Configuration de base

**Étape 1 - Créer le namespace :**
```bash
minikube kubectl -- apply -f base/namespace.yaml
```

**Étape 2 - Créer la ConfigMap :**
```bash
minikube kubectl -- apply -f base/configmap.yaml
```

**Étape 3 - Créer les Secrets :**
```bash
minikube kubectl -- apply -f base/secrets.yaml
```

## Base de données et stockage

**Étape 4 - Déployer PostgreSQL :**
```bash
minikube kubectl -- apply -f postgres/pvc.yaml
minikube kubectl -- apply -f postgres/deployment.yaml
minikube kubectl -- apply -f postgres/service.yaml
```

**Étape 5 - Déployer PgAdmin :**
```bash
minikube kubectl -- apply -f pgadmin/pvc.yaml
minikube kubectl -- apply -f pgadmin/deployment.yaml
minikube kubectl -- apply -f pgadmin/service.yaml
```

**Étape 6 - Déployer MinIO :**
```bash
minikube kubectl -- apply -f minio/pvc.yaml
minikube kubectl -- apply -f minio/deployment.yaml
minikube kubectl -- apply -f minio/service.yaml
```

**Étape 7 - Attendre que Postgres soit prêt :**
```bash
minikube kubectl -- wait --for=condition=ready pod -l app=postgres -n sitebuilder --timeout=180s
```

**Étape 8 - Attendre que MinIO soit prêt :**
```bash
minikube kubectl -- wait --for=condition=ready pod -l app=minio -n sitebuilder --timeout=180s
```

## Services applicatifs

**Étape 9 - Déployer Builder Service :**
```bash
minikube kubectl -- apply -f builder-service/deployment.yaml
minikube kubectl -- apply -f builder-service/service.yaml
```

**Étape 10 - Déployer Catalogue Service :**
```bash
minikube kubectl -- apply -f catalogue-service/deployment.yaml
minikube kubectl -- apply -f catalogue-service/service.yaml
```

**Étape 11 - Déployer Chatbot Service :**
```bash
minikube kubectl -- apply -f chatbot-service/deployment.yaml
minikube kubectl -- apply -f chatbot-service/service.yaml
```

## Point d'entrée

**Étape 12 - Déployer Nginx :**
```bash
minikube kubectl -- apply -f nginx/deployment.yaml
minikube kubectl -- apply -f nginx/service.yaml
```

## Vérification

**Étape 13 - Vérifier tous les pods :**
```bash
minikube kubectl -- get pods -n sitebuilder
```

**Étape 14 - Vérifier tous les services :**
```bash
minikube kubectl -- get services -n sitebuilder
```

**Étape 15 - Obtenir l'IP externe du LoadBalancer :**
```bash
minikube kubectl -- get service nginx-service -n sitebuilder
```

**Étape 16 - Tester l'application :**
```bash
curl http://127.0.0.1/devops/shanify
```

## Debug (si besoin)

**Voir les logs nginx :**
```bash
minikube kubectl -- logs -n sitebuilder -l app=nginx --tail=50
```

**Voir les logs builder-service :**
```bash
minikube kubectl -- logs -n sitebuilder -l app=builder-service --tail=50
```

**Voir les logs catalogue-service :**
```bash
minikube kubectl -- logs -n sitebuilder -l app=catalogue-service --tail=50
```

**Voir tous les événements du namespace :**
```bash
minikube kubectl -- get events -n sitebuilder --sort-by='.lastTimestamp'
```

## Nettoyage (quand terminé)

**Supprimer tout :**
```bash
minikube kubectl -- delete namespace sitebuilder
```


# Commandes de debug avancées

## 1. Voir les logs complets des services en échec

**Builder service (tous les restarts) :**
```bash
minikube kubectl -- logs -n sitebuilder deployment/builder-service --all-containers=true --previous
```

**Catalogue service (tous les restarts) :**
```bash
minikube kubectl -- logs -n sitebuilder deployment/catalogue-service --all-containers=true --previous
```

**Logs en temps réel (streaming) :**
```bash
minikube kubectl -- logs -n sitebuilder -f -l app=builder-service
```

## 2. Inspecter la configuration des pods

**Voir la configuration complète d'un pod :**
```bash
minikube kubectl -- describe pod -n sitebuilder -l app=builder-service
```

**Voir les variables d'environnement d'un pod :**
```bash
minikube kubectl -- exec -n sitebuilder deployment/builder-service -- env | sort
```

## 3. Tester la connectivité réseau

**Test de connexion à Postgres depuis builder :**
```bash
minikube kubectl -- exec -n sitebuilder deployment/builder-service -- sh -c "apt update && apt install -y postgresql-client && psql postgresql://postgres:53c16ea5b106fc210fc811663b1dd915@postgres-service:5432/sitebuilder -c 'SELECT 1'"
```

**Test de connexion à MinIO depuis builder :**
```bash
minikube kubectl -- exec -n sitebuilder deployment/builder-service -- sh -c "curl -v http://minio-service:9000/minio/health/live"
```

**Test DNS (résolution des noms de services) :**
```bash
minikube kubectl -- exec -n sitebuilder deployment/builder-service -- nslookup postgres-service
minikube kubectl -- exec -n sitebuilder deployment/builder-service -- nslookup minio-service
```

## 4. Inspecter les ressources du namespace

**Vue d'ensemble complète :**
```bash
minikube kubectl -- get all,cm,secrets,pvc -n sitebuilder -o wide
```

**Utilisation des ressources (CPU/RAM) :**
```bash
minikube kubectl -- top pods -n sitebuilder
```

**Détails des endpoints (connexions réseau) :**
```bash
minikube kubectl -- get endpoints -n sitebuilder
```

## 5. Inspecter les ConfigMaps et Secrets

**Voir le contenu de la ConfigMap :**
```bash
minikube kubectl -- get configmap app-config -n sitebuilder -o yaml
```

**Voir les clés des secrets (sans valeurs) :**
```bash
minikube kubectl -- get secret app-secrets -n sitebuilder -o jsonpath='{.data}' | jq 'keys'
```

**Décoder une valeur de secret :**
```bash
minikube kubectl -- get secret app-secrets -n sitebuilder -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

## 6. Vérifier les volumes persistants

**Voir les PVC et leur statut :**
```bash
minikube kubectl -- get pvc -n sitebuilder
```

**Détails d'un PVC :**
```bash
minikube kubectl -- describe pvc postgres-pvc -n sitebuilder
```

**Voir les PV (volumes physiques) :**
```bash
minikube kubectl -- get pv
```

## 7. Tester l'application depuis l'intérieur du cluster

**Lancer un pod temporaire de debug :**
```bash
minikube kubectl -- run -n sitebuilder curl-test --image=curlimages/curl --rm -it --restart=Never -- sh
```

Puis dedans :
```bash
curl http://nginx-service/devops/shanify
curl http://builder-service:8000/
curl http://catalogue-service:8000/
```

## 8. Historique des rollouts

**Voir l'historique des déploiements :**
```bash
minikube kubectl -- rollout history deployment/nginx -n sitebuilder
minikube kubectl -- rollout history deployment/builder-service -n sitebuilder
```

**Rollback au déploiement précédent :**
```bash
minikube kubectl -- rollout undo deployment/nginx -n sitebuilder
```

## 9. Métriques Minikube

**Dashboard Kubernetes (UI graphique) :**
```bash
minikube dashboard
```

**Voir les addons actifs :**
```bash
minikube addons list
```

**Activer les métriques :**
```bash
minikube addons enable metrics-server
```

## 10. Export de configurations

**Exporter la config complète d'un deployment :**
```bash
minikube kubectl -- get deployment builder-service -n sitebuilder -o yaml > builder-deployment-dump.yaml
```

---

# Action immédiate recommandée
