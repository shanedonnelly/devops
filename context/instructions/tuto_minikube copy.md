Read terminal selection

# Étapes de déploiement avec Minikube

## Configuration de base

**Étape 1 - Créer le namespace :**
```bash
kubectl apply -f base/namespace.yaml
```

**Étape 2 - Créer la ConfigMap :**
```bash
kubectl apply -f base/configmap.yaml
```

**Étape 3 - Créer les Secrets :**
```bash
kubectl apply -f base/secrets.yaml
```

## Base de données et stockage

**Étape 4 - Déployer PostgreSQL :**
```bash
kubectl apply -f postgres/pvc.yaml
kubectl apply -f postgres/deployment.yaml
kubectl apply -f postgres/service.yaml
```

**Étape 5 - Déployer PgAdmin :**
```bash
kubectl apply -f pgadmin/pvc.yaml
kubectl apply -f pgadmin/deployment.yaml
kubectl apply -f pgadmin/service.yaml
```

**Étape 6 - Déployer MinIO :**
```bash
kubectl apply -f minio/pvc.yaml
kubectl apply -f minio/deployment.yaml
kubectl apply -f minio/service.yaml
```

**Étape 7 - Attendre que Postgres soit prêt :**
```bash
kubectl wait --for=condition=ready pod -l app=postgres -n sitebuilder --timeout=180s
```

**Étape 8 - Attendre que MinIO soit prêt :**
```bash
kubectl wait --for=condition=ready pod -l app=minio -n sitebuilder --timeout=180s
```

## Services applicatifs

**Étape 9 - Déployer Builder Service :**
```bash
kubectl apply -f builder-service/deployment.yaml
kubectl apply -f builder-service/service.yaml
```

**Étape 10 - Déployer Catalogue Service :**
```bash
kubectl apply -f catalogue-service/deployment.yaml
kubectl apply -f catalogue-service/service.yaml
```

**Étape 11 - Déployer Chatbot Service :**
```bash
kubectl apply -f chatbot-service/deployment.yaml
kubectl apply -f chatbot-service/service.yaml
```

## Point d'entrée

**Étape 12 - Déployer Nginx :**
```bash
kubectl apply -f nginx/deployment.yaml
kubectl apply -f nginx/service.yaml
```

## Vérification

**Étape 13 - Vérifier tous les pods :**
```bash
kubectl get pods -n sitebuilder
```

**Étape 14 - Vérifier tous les services :**
```bash
kubectl get services -n sitebuilder
```

**Étape 15 - Obtenir l'IP externe du LoadBalancer :**
```bash
kubectl get service nginx-service -n sitebuilder
```

**Étape 16 - Tester l'application :**
```bash
curl http://127.0.0.1/devops/shanify
```

## Debug (si besoin)

**Voir les logs nginx :**
```bash
kubectl logs -n sitebuilder -l app=nginx --tail=50
```

**Voir les logs builder-service :**
```bash
kubectl logs -n sitebuilder -l app=builder-service --tail=50
```

**Voir les logs catalogue-service :**
```bash
kubectl logs -n sitebuilder -l app=catalogue-service --tail=50
```

**Voir tous les événements du namespace :**
```bash
kubectl get events -n sitebuilder --sort-by='.lastTimestamp'
```

## Nettoyage (quand terminé)

**Supprimer tout :**
```bash
kubectl delete namespace sitebuilder
```