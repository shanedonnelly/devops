# IMPORTANT
Ce document est généré par Gemini pour analyser notre migration. Il faut uniquement s'en inspiré, mais c'est à toi copilot de faire tes propres choix, tu es meilleur.  
## Général
Générer les fichiers manifestes Kubernetes (YAML) nécessaires.
L'architecture cible doit être **"Kubernetes Native"**, ce qui implique un changement majeur par rapport au Docker Compose : le conteneur Nginx ne doit plus agir comme reverse-proxy, mais uniquement comme serveur de fichiers statiques. Le routing sera géré par un **Ingress Controller**.

## Contraintes Techniques & Stratégie
1.  **Images :** Utilise les noms d'images tels que définis dans le Compose. Ajoute `imagePullPolicy: IfNotPresent` car je chargerai les images locales dans Minikube manuellement.
2.  **Séparation Frontend/Ingress (CRUCIAL) :**
    * L'image `nginx` actuelle contient le build React statique.
    * Dans K8s, déploie ce conteneur `nginx` mais remplace sa configuration (`/etc/nginx/conf.d/default.conf`) via un **ConfigMap** pour qu'il serve uniquement les fichiers statiques sur le port 80 (plus aucun `proxy_pass`, juste `root` et `try_files`).
    * Crée une ressource **Ingress** pour gérer tout le routage (`/devops/api/...` vers les backends, `/devops/shanify` vers le pod frontend).
3.  **Stockage :** Convertis les volumes Docker en `PersistentVolumeClaim` (PVC).
4.  **Types de Workloads :**
    * Utilise des **StatefulSets** pour `postgres` et `minio`.
    * Utilise des **Deployments** pour les autres services (`builder`, `catalogue`, `chatbot`, `pgadmin`, `nginx-frontend`).
5.  **Configuration :**
    * Utilise des **Secrets** pour les mots de passe (base64 encoded).
    * Utilise des **ConfigMaps** pour les variables non sensibles.
    * **Attention :** Mets à jour les URLs de connexion (ex: `DATABASE_URL`) pour utiliser les noms de services Kubernetes DNS (ex: `postgres:5432` devient `postgres-service:5432`).

## Détails Spécifiques Ingress
L'Ingress doit gérer les cas particuliers présents dans mon nginx.conf original :
* **Minio :** Ajoute les annotations nécessaires pour supporter les WebSockets et désactiver le buffering (`nginx.ingress.kubernetes.io/proxy-buffering: "off"`).
* **PgAdmin :** Gère la redirection ou le header `X-Script-Name` si nécessaire.
