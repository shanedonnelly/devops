# DevOps Project - Shanify Site Builder

Ce dépôt contient l'ensemble du code source et de l'infrastructure DevOps pour **Shanify**, une plateforme SaaS de création de sites e-commerce.

## 1. Description du Produit

Shanify est une application complète permettant aux utilisateurs de créer et gérer leurs propres boutiques en ligne. Le flux utilisateur est le suivant :

1.  **Authentification** : Inscription et connexion sécurisées.
2.  **Dashboard** : Gestion des sites existants et création de nouveaux sites (génération d'ID unique).
3.  **Éditeur de Site** : Configuration de l'apparence (titre, description, template CSS) et gestion du catalogue produits (catégories, produits, variants).
4.  **Site Public** : Génération automatique d'une URL publique (`/public_site/{id}`) affichant le site configuré pour les clients finaux.
5.  **Assistant IA** : Un chatbot intégré pour assister l'utilisateur.

L'architecture repose sur des microservices (Builder, Catalogue, Chatbot) communiquant via des API REST, avec un stockage de fichiers sur MinIO et des données sur PostgreSQL.

---

## 2. Objectifs Pédagogiques

Le projet vise à fournir une vision complète des outils et pratiques DevOps modernes :

*   **Conteneurisation** avec Docker (Images optimisées, Multi-stage builds).
*   **Orchestration** locale avec Docker Compose et production avec Kubernetes.
*   **Intégration Continue (CI)** avec GitHub Actions (Tests unitaires, E2E, Build).
*   **Livraison Continue (CD)** avec gestion des environnements (Staging vs Production).
*   **Infrastructure as Code** via Kustomize.
*   **Bonne gestion du versionnement** (Semantic Versioning, Docker Image Tags).

---

## 3. Structure du Projet

### **.github/workflows/**
Les pipelines d'automatisation CI/CD :
```text
.github/workflows/
├── ci.yml              # Pipeline d'Intégration Continue (Tests unitaires, E2E, Build check) déclenché sur les Pull Requests.
├── cd_docker_push.yml  # Pipeline de Livraison (Build & Push DockerHub) déclenché sur la branche 'dev'.
└── cd_prod.yml         # Pipeline de Déploiement Production (Sync tags staging -> prod) déclenché sur la branche 'main'.
```

### **backend/**
Le cœur de l'application, divisé en microservices et configurations d'infrastructure :

*   **builder-service/** : Service Python/FastAPI gérant la configuration des sites et l'authentification.
*   **catalogue-service/** : Service Python/FastAPI gérant les produits, catégories et stocks.
*   **chatbot-microservice/** : Service d'IA pour l'assistance utilisateur.
*   **nginx/** : Configuration du Reverse Proxy et serveur statique pour le frontend en production.
*   **script/** : Scripts utilitaires pour la gestion locale (build, start, logs, versioning).
*   **docker-compose.yaml** : Orchestration de l'environnement de développement local.

### **backend/kubernetes/**
Configuration complète pour le déploiement sur cluster Kubernetes, utilisant **Kustomize** pour gérer les différences entre environnements :

*   **base/** : Définitions de base des ressources (Deployments, Services, PVC) communes à tous les environnements.
*   **overlays/** :
    *   `staging/` : Patchs de configuration spécifiques à l'environnement de test (Ingress, ConfigMaps, Certificats Let's Encrypt Staging).
    *   `production/` : Patchs pour la production (Domaines réels, Certificats Prod).
*   **Scripts de gestion** : start_staging.sh, start_production.sh pour déployer facilement les overlays.

### **front/**
Application Frontend réalisée avec **React**, **TypeScript** et **Vite**. Elle consomme les API du backend et fournit l'interface utilisateur (Dashboard, Éditeur, Site Public).

---

## 4. Installation et Démarrage Local

Pour tester le projet en local, nous utilisons deux terminaux séparés : un pour l'infrastructure backend (Docker) et un pour le frontend (Node.js).

### Prérequis
*   Docker & Docker Compose
*   Node.js & npm
*   Git

### Étape 1 : Configuration de l'environnement
Dans le dossier backend, créez un fichier `.env` en vous basant sur le modèle fourni.
*(Référez-vous au fichier .env.example pour les clés nécessaires, les valeurs par défaut suffisent pour le local).*

### Étape 2 : Lancer le Backend (Terminal 1)
Placez-vous dans le dossier backend et lancez les scripts de démarrage. Cela va construire les images et lancer les conteneurs (Base de données, MinIO, API Services).

```bash
cd backend
# Construit et démarre l'orchestration
./script/start_docker_compose.sh
```
*Note : Attendez que les services soient "Healthy" ou que les logs indiquent que les serveurs tournent.*

### Étape 3 : Lancer le Frontend (Terminal 2)
Lancez le serveur de développement React qui se connectera à votre backend local.

```bash
cd front
npm install
npm run dev
```

L'application sera accessible (par défaut) sur l'URL indiquée par Vite (ex: `http://localhost:5173`).

---

## 5. Accès aux Services Locaux

Une fois l'environnement démarré via le script backend :

*   **Frontend App** : Via le terminal frontend (`http://localhost:5173`)
*   **Swagger Builder Service** : `http://localhost/devops/api/builder-service/docs`
*   **Swagger Catalogue Service** : `http://localhost/devops/api/catalogue-service/docs`
*   **PgAdmin (BDD)** : `http://localhost/devops/api/pgadmin`
*   **MinIO Console** : `http://localhost/devops/api/minio`
