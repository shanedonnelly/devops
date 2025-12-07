# DEVOPS PROJECT

Ce dépôt contient un ensemble de ressources, tutoriels, instructions et projets complets liés aux pratiques DevOps modernes.
Il est structuré autour de trois grands axes : **Backend**, **Frontend**, et **Documentation pédagogique**.

## 1. Structure du projet

```
devops-main/
│── backend/           # Code backend, API, exemples d’automatisation, CI/CD backend
│── front/             # Code frontend, interfaces web, démonstrations
│── .github/           # Workflows CI/CD (GitHub Actions)
│── README.md          # Documentation principale
```

---

## 2. Objectifs pédagogiques

Le projet vise à fournir une vision complète des outils et pratiques DevOps :

* Conteneurisation avec Docker
* Orchestration (Kubernetes, docker-compose)
* Intégration Continue (CI) avec GitHub Actions
* Livraison Continue (CD)
* Automatisation backend (API, scripts, pipelines)
* Déploiement d’une application frontend
* Bonne gestion du versionnement (Docker Image Tags)

---

## 3. Description des principaux dossiers

### **backend/**

Contient :

* Code source backend (API, microservices, scripts)
* Dockerfiles
* Pipelines d’automatisation
* Configuration pour exécution locale et
* Manifest Kubernetes de configuration de production

### **front/**

Propose :

* Interfaces web ou dashboard
* Démonstrations déployables via CI/CD
* Environnements configurés pour servir l’application

### **.github/**

Comprend :

* Workflows GitHub Actions
* Pipelines CI (tests, build)
* Pipelines CD (déploiement)

---

## 4. Prérequis

* Docker & Docker Compose
* Git
* Node.js 
* Python
* GitHub Account pour CI/CD

---

## 5. Exécution du projet

### **Lancer le backend**

```
cd backend
docker-compose up --build
```

### **Lancer le frontend**

```
cd front
npm install
npm run dev
```

### **Exécuter les tutoriels**

Chaque tutoriel dans `tutos/` contient ses instructions propres.

---

## 6. CI/CD

Le dépôt intègre :

* Tests automatisés
* Build automatisé des images Docker
* Déploiement automatique (si configuré)

Les workflows se trouvent dans :
`.github/workflows/`
