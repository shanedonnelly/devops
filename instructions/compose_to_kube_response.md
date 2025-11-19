shanedonnelly: tout est écrit dans prompt à suivre, respecte bien les sorties demandé. si il te manque du contexte donne le moi. 

GitHub Copilot: Read terminal selection

# Migration Docker Compose → Kubernetes

## 1) Modifications du Dockerfile nginx

**Aucune modification nécessaire** pour le Dockerfile de nginx. Il reste identique car :
- Il sert toujours le frontend React
- Il continue de faire du reverse proxy (c'est une bonne pratique dans Kubernetes)
- La configuration nginx.conf sera utilisée telle quelle

Le reverse proxy nginx reste pertinent car il :
- Centralise les routes `/devops/api/*`
- Gère le routage frontend React
- Simplifie l'accès externe via un seul point d'entrée (Service LoadBalancer ou Ingress)

## 2) Structure des manifests Kubernetes

### Commandes de création des fichiers :

```bash
# Créer la structure
mkdir -p kubernetes/{postgres,pgadmin,minio,builder-service,catalogue-service,chatbot-service,nginx,base}

# Fichiers de configuration globaux
touch kubernetes/base/namespace.yaml
touch kubernetes/base/configmap.yaml
touch kubernetes/base/secrets.yaml

# PostgreSQL
touch kubernetes/postgres/deployment.yaml
touch kubernetes/postgres/service.yaml
touch kubernetes/postgres/pvc.yaml

# PgAdmin
touch kubernetes/pgadmin/deployment.yaml
touch kubernetes/pgadmin/service.yaml
touch kubernetes/pgadmin/pvc.yaml

# MinIO
touch kubernetes/minio/deployment.yaml
touch kubernetes/minio/service.yaml
touch kubernetes/minio/pvc.yaml

# Builder Service
touch kubernetes/builder-service/deployment.yaml
touch kubernetes/builder-service/service.yaml

# Catalogue Service
touch kubernetes/catalogue-service/deployment.yaml
touch kubernetes/catalogue-service/service.yaml

# Chatbot Service
touch kubernetes/chatbot-service/deployment.yaml
touch kubernetes/chatbot-service/service.yaml

# Nginx (point d'entrée)
touch kubernetes/nginx/deployment.yaml
touch kubernetes/nginx/service.yaml
```

### Manifests Kubernetes :

#### Base - Namespace
````yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sitebuilder
````

#### Base - ConfigMap
````yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: sitebuilder
data:
  POSTGRES_DB: "sitebuilder"
  POSTGRES_USER: "postgres"
  PGADMIN_DEFAULT_EMAIL: "admin@sitebuilder.com"
  MINIO_ROOT_USER: "minioadmin"
  MINIO_BROWSER_REDIRECT_URL: "http://localhost/devops/api/minio"
  MINIO_DOMAIN: "localhost"
  DATABASE_URL: "postgresql://postgres:53c16ea5b106fc210fc811663b1dd915@postgres-service:5432/sitebuilder"
  MINIO_ENDPOINT: "minio-service:9000"
  CATALOGUE_BASE: "http://nginx-service/devops/api/catalogue-service"
````

#### Base - Secrets
````yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: sitebuilder
type: Opaque
stringData:
  POSTGRES_PASSWORD: "53c16ea5b106fc210fc811663b1dd915"
  PGADMIN_DEFAULT_PASSWORD: "53c16ea5b106fc210fc811663b1dd915"
  MINIO_ROOT_PASSWORD: "53c16ea5b106fc210fc811663b1dd915"
  SECRET_KEY: "a0dfd56e2920001adeedb552a58691c9"
  OPENROUTER_KEY: "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"
````

#### PostgreSQL - PVC
````yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: sitebuilder
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
````

#### PostgreSQL - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: sitebuilder
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:latest
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_PASSWORD
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: POSTGRES_DB
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - postgres
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - postgres
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
````

#### PostgreSQL - Service
````yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: sitebuilder
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
````

#### PgAdmin - PVC
````yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pgadmin-pvc
  namespace: sitebuilder
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
````

#### PgAdmin - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgadmin
  namespace: sitebuilder
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pgadmin
  template:
    metadata:
      labels:
        app: pgadmin
    spec:
      containers:
      - name: pgadmin
        image: dpage/pgadmin4:latest
        ports:
        - containerPort: 80
        env:
        - name: PGADMIN_DEFAULT_EMAIL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: PGADMIN_DEFAULT_EMAIL
        - name: PGADMIN_DEFAULT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: PGADMIN_DEFAULT_PASSWORD
        volumeMounts:
        - name: pgadmin-storage
          mountPath: /var/lib/pgadmin
      volumes:
      - name: pgadmin-storage
        persistentVolumeClaim:
          claimName: pgadmin-pvc
````

#### PgAdmin - Service
````yaml
apiVersion: v1
kind: Service
metadata:
  name: pgadmin-service
  namespace: sitebuilder
spec:
  selector:
    app: pgadmin
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
````

#### MinIO - PVC
````yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-pvc
  namespace: sitebuilder
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
````

#### MinIO - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
  namespace: sitebuilder
spec:
  replicas: 1
  selector:
    matchLabels:
      app: minio
  template:
    metadata:
      labels:
        app: minio
    spec:
      containers:
      - name: minio
        image: minio/minio:latest
        args:
        - server
        - /data
        - --console-address
        - :9001
        ports:
        - containerPort: 9000
          name: api
        - containerPort: 9001
          name: console
        env:
        - name: MINIO_ROOT_USER
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MINIO_ROOT_USER
        - name: MINIO_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MINIO_ROOT_PASSWORD
        - name: MINIO_BROWSER_REDIRECT_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MINIO_BROWSER_REDIRECT_URL
        - name: MINIO_DOMAIN
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MINIO_DOMAIN
        volumeMounts:
        - name: minio-storage
          mountPath: /data
        livenessProbe:
          httpGet:
            path: /minio/health/live
            port: 9000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /minio/health/live
            port: 9000
          initialDelaySeconds: 10
          periodSeconds: 5
      volumes:
      - name: minio-storage
        persistentVolumeClaim:
          claimName: minio-pvc
````

#### MinIO - Service
````yaml
apiVersion: v1
kind: Service
metadata:
  name: minio-service
  namespace: sitebuilder
spec:
  selector:
    app: minio
  ports:
  - port: 9000
    targetPort: 9000
    name: api
  - port: 9001
    targetPort: 9001
    name: console
  type: ClusterIP
````

#### Builder Service - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: builder-service
  namespace: sitebuilder
spec:
  replicas: 2
  selector:
    matchLabels:
      app: builder-service
  template:
    metadata:
      labels:
        app: builder-service
    spec:
      containers:
      - name: builder-service
        image: shanedonnelly34/builder-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_URL
        - name: MINIO_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MINIO_ENDPOINT
        - name: MINIO_ROOT_USER
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MINIO_ROOT_USER
        - name: MINIO_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MINIO_ROOT_PASSWORD
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: SECRET_KEY
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
````

#### Builder Service - Service
````yaml
apiVersion: v1
kind: Service
metadata:
  name: builder-service
  namespace: sitebuilder
spec:
  selector:
    app: builder-service
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
````

#### Catalogue Service - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalogue-service
  namespace: sitebuilder
spec:
  replicas: 2
  selector:
    matchLabels:
      app: catalogue-service
  template:
    metadata:
      labels:
        app: catalogue-service
    spec:
      containers:
      - name: catalogue-service
        image: shanedonnelly34/catalogue-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_URL
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: SECRET_KEY
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
````

#### Catalogue Service - Service
````yaml
apiVersion: v1
kind: Service
metadata:
  name: catalogue-service
  namespace: sitebuilder
spec:
  selector:
    app: catalogue-service
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
````

#### Chatbot Service - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatbot-service
  namespace: sitebuilder
spec:
  replicas: 2
  selector:
    matchLabels:
      app: chatbot-service
  template:
    metadata:
      labels:
        app: chatbot-service
    spec:
      containers:
      - name: chatbot-service
        image: shanedonnelly34/chatbot-microservice:latest
        ports:
        - containerPort: 8000
        env:
        - name: CATALOGUE_BASE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: CATALOGUE_BASE
        - name: OPENROUTER_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: OPENROUTER_KEY
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
````

#### Chatbot Service - Service
````yaml
apiVersion: v1
kind: Service
metadata:
  name: chatbot-api
  namespace: sitebuilder
spec:
  selector:
    app: chatbot-service
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
````

#### Nginx - Deployment
````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: sitebuilder
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: shanedonnelly34/nginx:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /devops/shanify
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /devops/shanify
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
````

#### Nginx - Service (LoadBalancer)
````yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: sitebuilder
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
````

## 3) Résumé de la stratégie

### Architecture adoptée :
- **Namespace dédié** : `sitebuilder` pour isolation
- **Services ClusterIP** : Communication interne entre pods
- **Service LoadBalancer** : Nginx comme point d'entrée unique (remplace le port 80 du docker-compose)
- **ConfigMap/Secrets** : Séparation configuration/sensible
- **PVC** : Persistance des données (postgres, pgadmin, minio)
- **Replicas=2** : Haute disponibilité pour les services applicatifs
- **Health checks** : Liveness/Readiness probes pour auto-guérison

### Conditions de fonctionnement à 100% :
1. **Minikube doit avoir le tunnel activé** pour le LoadBalancer
2. **Les health endpoints `/health`** doivent exister dans vos FastAPI
3. **Les images DockerHub** doivent être accessibles publiquement
4. **Minikube doit avoir assez de ressources** (CPU/RAM) pour 10+ pods
5. **Le storage provisioner** doit être actif (par défaut avec minikube)

## 4) Valeurs à ajuster selon votre environnement

### À décider :
1. **Storage sizes** dans les PVC :
   - postgres: 5Gi (ajuster selon vos données)
   - minio: 10Gi (ajuster selon vos fichiers)
   - pgadmin: 1Gi (suffisant généralement)

2. **Replicas** des services applicatifs :
   - builder-service: 2 (ajuster selon charge)
   - catalogue-service: 2 (ajuster selon charge)
   - chatbot-service: 2 (ajuster selon charge)
   - nginx: 2 (ajuster selon trafic)

3. **Resources limits/requests** (non spécifiés, à ajouter) :
   ```yaml
   resources:
     requests:
       memory: "256Mi"
       cpu: "250m"
     limits:
       memory: "512Mi"
       cpu: "500m"
   ```

4. **Health check paths** : Si vos services n'ont pas `/health`, ajustez les probes

## 5) Tutorial de test avec Minikube

```bash
# 1. Démarrer Minikube avec suffisamment de ressources
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Activer le tunnel dans un terminal séparé (le laisser ouvert)
minikube tunnel

# 3. Appliquer les manifests dans l'ordre
cd ~/Documents/ig5/devops/backend/kubernetes

# Configuration de base
kubectl apply -f base/namespace.yaml
kubectl apply -f base/configmap.yaml
kubectl apply -f base/secrets.yaml

# Base de données et services de stockage
kubectl apply -f postgres/
kubectl apply -f pgadmin/
kubectl apply -f minio/

# Attendre que les bases soient prêtes (2-3 minutes)
kubectl wait --for=condition=ready pod -l app=postgres -n sitebuilder --timeout=180s
kubectl wait --for=condition=ready pod -l app=minio -n sitebuilder --timeout=180s

# Services applicatifs
kubectl apply -f builder-service/
kubectl apply -f catalogue-service/
kubectl apply -f chatbot-service/

# Point d'entrée (nginx)
kubectl apply -f nginx/

# 4. Vérifier le déploiement
kubectl get all -n sitebuilder

# 5. Obtenir l'IP externe du LoadBalancer
kubectl get service nginx-service -n sitebuilder

# Attendre que EXTERNAL-IP ne soit plus <pending>
# Avec minikube tunnel, ce sera généralement 127.0.0.1

# 6. Tester l'application
# Remplacer <EXTERNAL-IP> par l'IP obtenue
curl http://<EXTERNAL-IP>/devops/shanify

# 7. Voir les logs en cas de problème
kubectl logs -n sitebuilder -l app=nginx --tail=50
kubectl logs -n sitebuilder -l app=builder-service --tail=50
kubectl logs -n sitebuilder -l app=catalogue-service --tail=50

# 8. Debug interactif
kubectl exec -it -n sitebuilder deployment/postgres -- psql -U postgres -d sitebuilder
kubectl port-forward -n sitebuilder service/pgadmin-service 8080:80

# 9. Nettoyer complètement
kubectl delete namespace sitebuilder

# 10. Arrêter Minikube
minikube stop
```

### Accès aux services :
- **Frontend** : `http://<EXTERNAL-IP>/devops/shanify`
- **Builder API** : `http://<EXTERNAL-IP>/devops/api/builder-service/`
- **Catalogue API** : `http://<EXTERNAL-IP>/devops/api/catalogue-service/`
- **Chatbot API** : `http://<EXTERNAL-IP>/devops/api/chatbot/`
- **PgAdmin** : `http://<EXTERNAL-IP>/devops/api/pgadmin/`
- **MinIO Console** : `http://<EXTERNAL-IP>/devops/api/minio/`