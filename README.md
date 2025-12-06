# DEVOPS PROJECT

Ce dépôt contient un ensemble de ressources, tutoriels, instructions et projets complets liés aux pratiques DevOps modernes.
Il est structuré autour de trois grands axes : **Backend**, **Frontend**, et **Documentation pédagogique**.

## 1. Structure du projet

```
devops-main/
│── backend/           # Code backend, API, exemples d’automatisation, CI/CD backend
│── front/             # Code frontend, interfaces web, démonstrations
│── instructions/      # Guides de travaux pratiques, consignes, exercices DevOps
│── tutos/             # Tutoriels étape par étape (Docker, K8s, GitHub Actions…)
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
* Bonne gestion du versionnement (Git, GitHub Flow)

---

## 3. Description des principaux dossiers

### **backend/**

Contient :

* Code source backend (API, microservices, scripts)
* Dockerfiles
* Pipelines d’automatisation
* Configuration pour exécution locale et en CI

### **front/**

Propose :

* Interfaces web ou dashboard
* Démonstrations déployables via CI/CD
* Environnements configurés pour servir l’application

### **instructions/**

Inclut :

* Travaux pratiques
* Sujets d’examen ou d’évaluation
* Fiches de route (roadmaps)
* Consignes pour installer, configurer et livrer des projets DevOps

### **tutos/**

Contient plusieurs tutoriels :

* Installation et prise en main Docker
* Création d’images et optimisation
* Introduction à Kubernetes
* Workflows CI/CD complets
* Déploiements automatisés

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
* Linting
* Vérification de qualité de code
* Déploiement automatique (si configuré)

Les workflows se trouvent dans :
`.github/workflows/`

---

## 7. Contribution

1. Forker le repository
2. Créer une branche :

   ```
   git checkout -b feature/ma-feature
   ```
3. Commit + push
4. Ouvrir une Pull Request
