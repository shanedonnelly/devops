# DevOps - Website Builder Platform

A comprehensive microservices-based website builder platform that enables users to create, manage, and deploy their own product catalogue websites with an AI-powered chatbot assistant.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Services](#-services)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)

## 🎯 Project Overview

This platform provides a simple yet powerful website builder where users can:

- **Register/Login**: Secure user authentication with JWT tokens
- **Dashboard**: Manage multiple websites (create, delete, select for editing)
- **Site Editor**: Configure site settings (title, description, contact text, CSS templates)
- **Catalogue Management**: Organize products into categories with variants and stock management
- **Public Site**: Display customer-facing product catalogues
- **AI Chatbot**: Intelligent assistant powered by OpenRouter for customer support

## 🏗 Architecture

The application follows a microservices architecture with the following key components:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                    TypeScript + Vite + React Router          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │    NGINX    │ ← Reverse Proxy & Static Serving
                    └──────┬──────┘
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Builder │      │Catalogue│      │ Chatbot │
    │ Service │      │ Service │      │ Service │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                 │
         └────────┬───────┴─────────────────┘
                  │
         ┌────────┴────────┐
         │   PostgreSQL    │
         │   (via Prisma)  │
         └─────────────────┘
         ┌─────────────────┐
         │     MinIO       │ ← Object Storage
         │ (S3-compatible) │
         └─────────────────┘
         ┌─────────────────┐
         │    PGAdmin      │ ← Database Management
         └─────────────────┘
```

## 🛠 Technology Stack

### Frontend
- **React 19**: Modern UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API calls
- **ESLint**: Code quality and consistency

### Backend
- **FastAPI**: High-performance Python web framework
- **Prisma**: Next-generation ORM for database operations
- **Python-JOSE**: JWT token generation and validation
- **Bcrypt**: Password hashing
- **Uvicorn**: ASGI server

### Database & Storage
- **PostgreSQL**: Primary relational database
- **MinIO**: S3-compatible object storage for site configurations
- **PGAdmin**: Database administration interface

### Infrastructure
- **Docker & Docker Compose**: Local development environment
- **Kubernetes (Minikube)**: Local production simulation
- **Kubernetes**: Production deployment with Kustomize
- **NGINX**: Reverse proxy and static file serving

### DevOps & CI/CD
- **GitHub Actions**: Automated CI/CD pipelines
- **Docker Hub**: Container image registry
- **Let's Encrypt**: SSL/TLS certificates (production)

### AI/ML
- **OpenRouter API**: AI-powered chatbot responses

## 📁 Project Structure

```
devops/
├── backend/                          # Backend services and infrastructure
│   ├── builder-service/              # Main authentication and site management service
│   │   ├── app.py                    # FastAPI application and routes
│   │   ├── models.py                 # Pydantic models and DTOs
│   │   ├── service.py                # Business logic services
│   │   ├── schema.prisma             # Database schema (master copy)
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── Dockerfile                # Production container image
│   │   ├── Dockerfile.test           # Testing container image
│   │   └── VERSION                   # Service version
│   │
│   ├── catalogue-service/            # Product catalogue management service
│   │   ├── app.py                    # FastAPI application and routes
│   │   ├── models.py                 # Catalogue-specific models
│   │   ├── service.py                # Catalogue business logic
│   │   ├── schema.prisma             # Database schema (copy)
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── Dockerfile                # Production container image
│   │   ├── Dockerfile.test           # Testing container image
│   │   └── VERSION                   # Service version
│   │
│   ├── chatbot-microservice/         # AI-powered chatbot service
│   │   ├── app/
│   │   │   └── main.py               # Chatbot logic with OpenRouter integration
│   │   ├── front/                    # Chatbot widget frontend
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── Dockerfile                # Production container image
│   │   ├── Dockerfile.test           # Testing container image
│   │   └── VERSION                   # Service version
│   │
│   ├── nginx/                        # Reverse proxy configuration
│   │   ├── nginx.conf                # Kubernetes nginx config
│   │   ├── nginx.conf.compose        # Docker Compose nginx config
│   │   ├── Dockerfile                # Kubernetes nginx image
│   │   ├── Dockerfile.compose        # Docker Compose nginx image
│   │   ├── frontend-build/           # Built frontend assets (generated)
│   │   └── VERSION                   # NGINX version
│   │
│   ├── kubernetes/                   # Kubernetes manifests
│   │   ├── base/                     # Base Kubernetes resources
│   │   │   ├── builder-service/      # Builder deployment & service
│   │   │   ├── catalogue-service/    # Catalogue deployment & service
│   │   │   ├── chatbot-service/      # Chatbot deployment & service
│   │   │   ├── nginx/                # NGINX deployment & service
│   │   │   ├── postgres/             # PostgreSQL deployment, PVC & service
│   │   │   ├── minio/                # MinIO deployment, PVC & service
│   │   │   ├── pgadmin/              # PGAdmin deployment, PVC & service
│   │   │   ├── configmap.yaml        # Base configuration
│   │   │   ├── secrets.yaml          # Sensitive data (generated, not committed)
│   │   │   └── kustomization.yaml    # Base kustomization
│   │   │
│   │   └── overlays/                 # Environment-specific overlays
│   │       ├── staging/              # Staging environment
│   │       │   ├── configmap-patch.yaml
│   │       │   ├── ingress.yaml      # Staging ingress with Let's Encrypt
│   │       │   ├── middlewares.yaml  # Traefik middlewares
│   │       │   ├── letsencrypt-staging.yaml
│   │       │   └── kustomization.yaml
│   │       │
│   │       └── production/           # Production environment
│   │           ├── configmap-patch.yaml
│   │           ├── ingress.yaml      # Production ingress
│   │           ├── middlewares.yaml
│   │           ├── letsencrypt-prod.yaml
│   │           └── kustomization.yaml
│   │
│   ├── script/                       # Utility scripts
│   │   ├── start_docker_compose.sh   # Start local dev environment
│   │   ├── stop_docker_compose.sh    # Stop local dev environment
│   │   ├── erase_docker_compose.sh   # Clean up local environment
│   │   ├── build_front.sh            # Build frontend for nginx
│   │   ├── new_version.sh            # Bump service versions
│   │   ├── auto_doc.sh               # Generate documentation
│   │   └── some_logs.sh              # View service logs
│   │
│   ├── test/                         # Test suites
│   │   ├── e2e/                      # End-to-end tests
│   │   │   ├── run_all.sh            # Run all E2E tests
│   │   │   ├── wait_for_services.sh  # Wait for services to be ready
│   │   │   ├── test_builder_auth_and_site.sh
│   │   │   ├── test_catalogue.sh
│   │   │   └── test_chatbot.sh
│   │   │
│   │   └── service/                  # Service-specific tests
│   │       ├── builder-service-test.sh
│   │       ├── catalogue-service-test.sh
│   │       └── chatbot-microservice-test.sh
│   │
│   └── docker-compose.yaml           # Local development stack
│
├── front/                            # Frontend React application
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   ├── pages/                    # Page components (Dashboard, Editor, etc.)
│   │   ├── services/                 # API service clients
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── utils/                    # Utility functions
│   │   ├── App.tsx                   # Main application component
│   │   └── main.tsx                  # Application entry point
│   │
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node.js dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite configuration
│   └── eslint.config.js              # ESLint configuration
│
├── instructions/                     # Project documentation and guides
│   ├── app-description.instructions.md
│   ├── tech-and-api-descrition.instructions.md
│   ├── coding.instructions.md
│   ├── end-to-end-userstory-and-intern-logic.instructions.md
│   ├── docker_compose_to_kubernetes.md
│   └── *.md                          # Various setup and tutorial files
│
├── tutos/                            # Tutorial files
│   ├── tuto_fast_api_http_basic_auth.txt
│   ├── tuto_fast_api_prisma.txt
│   ├── tuto_minio_web_docker_compose.txt
│   ├── tuto_pg_admin_pour_nous.txt
│   └── tuto_python_bcrypt.txt
│
├── .github/
│   └── workflows/                    # GitHub Actions workflows
│       ├── ci.yml                    # Continuous Integration pipeline
│       ├── cd_docker_push.yml        # Build & push to Docker Hub
│       └── cd_prod.yml               # Production deployment
│
└── README.md                         # This file
```

## 🔧 Services

### 1. Builder Service (Main Service)
**Port:** Internal - exposed via NGINX at `/devops/api/builder-service`

The core service handling user authentication and site management.

**Responsibilities:**
- User registration and authentication (JWT)
- Site CRUD operations
- Site configuration management (stored in MinIO)
- Database schema migrations (Prisma)

**Key Endpoints:**
- `POST /api/register` - Register new user
- `POST /api/login` - User login (returns JWT)
- `DELETE /api/users/{id}` - Delete user (authenticated)
- `GET /api/sites` - List user's sites (authenticated)
- `POST /api/sites` - Create new site (authenticated)
- `PUT /api/sites/{id}` - Update site (authenticated)
- `DELETE /api/sites/{id}` - Delete site (authenticated)
- `PUT /api/sites/{id}/config` - Update site configuration (authenticated)
- `GET /api/sites/{string_id}/config` - Get site configuration (public)

### 2. Catalogue Service
**Port:** Internal - exposed via NGINX at `/devops/api/catalogue-service`

Manages product catalogues with categories, products, and variants.

**Responsibilities:**
- Product catalogue retrieval and management
- Category, product, and variant CRUD operations
- Stock management through variants

**Key Endpoints:**
- `GET /api/sites/{site_string_id}/catalogue` - Get entire catalogue (public)
- `PUT /api/sites/{site_string_id}/catalogue` - Update catalogue (authenticated, owner only)

**Data Model:**
```
Site → Categories → Products → Variants (with stock)
```

### 3. Chatbot Microservice
**Port:** Internal - exposed via NGINX at `/devops/api/chatbot-service`

AI-powered customer support chatbot using OpenRouter API.

**Responsibilities:**
- Process customer queries
- Provide product information from catalogue
- Natural language understanding and response generation
- Context-aware conversations

**Integration:**
- Communicates with Catalogue Service to fetch product data
- Uses OpenRouter API for AI responses
- Fuzzy matching for product queries

### 4. NGINX Service
**Port:** 80 (HTTP) / 443 (HTTPS in production)

Reverse proxy and static file server.

**Responsibilities:**
- Route API requests to appropriate backend services
- Serve frontend React application
- Provide access to MinIO web interface at `/devops/api/minio`
- Provide access to PGAdmin at `/devops/api/adminer`
- Enable OpenAPI documentation for each service at `/devops/api/{service-name}/docs`

## 🚀 Getting Started

### Prerequisites

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18+) and **npm** (for frontend development)
- **Python** (3.10+) (for backend development)
- **Minikube** (optional, for Kubernetes testing)
- **kubectl** (optional, for Kubernetes deployment)

### Environment Setup

1. **Clone the repository:**
```bash
git clone https://github.com/shanedonnelly/devops.git
cd devops
```

2. **Create environment file:**
Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=sitebuilder

# PGAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=your_pgadmin_password

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_minio_password

# Application
SECRET_KEY=your-secret-key-for-jwt
OPENROUTER_KEY=your-openrouter-api-key
```

## 💻 Development

### Local Development with Docker Compose

1. **Start all services:**
```bash
cd backend
bash script/start_docker_compose.sh
# or manually:
docker compose up --build
```

2. **Access the application:**
- Frontend: http://localhost
- Builder Service API: http://localhost/devops/api/builder-service/docs
- Catalogue Service API: http://localhost/devops/api/catalogue-service/docs
- Chatbot Service API: http://localhost/devops/api/chatbot-service/docs
- MinIO Console: http://localhost/devops/api/minio
- PGAdmin: http://localhost/devops/api/adminer

3. **Stop services:**
```bash
bash script/stop_docker_compose.sh
# or manually:
docker compose down
```

4. **Clean up (remove volumes):**
```bash
bash script/erase_docker_compose.sh
# or manually:
docker compose down -v
```

### Frontend Development

```bash
cd front
npm install
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
```

### Backend Development

Each service can be run independently for development:

```bash
cd backend/builder-service  # or catalogue-service, chatbot-microservice

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client (builder-service only)
prisma generate

# Run migrations (builder-service only)
prisma migrate deploy

# Start development server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Testing

**Run all tests:**
```bash
cd backend
bash test/e2e/run_all.sh
```

**Run service-specific tests:**
```bash
cd backend

# Builder service
bash test/service/builder-service-test.sh

# Catalogue service
bash test/service/catalogue-service-test.sh

# Chatbot service
bash test/service/chatbot-microservice-test.sh
```

## 🚢 Deployment

### Kubernetes with Minikube (Local Production Simulation)

1. **Start Minikube:**
```bash
minikube start
```

2. **Build images locally:**
```bash
eval $(minikube docker-env)
docker build -t builder-service:latest backend/builder-service
docker build -t catalogue-service:latest backend/catalogue-service
docker build -t chatbot-microservice:latest backend/chatbot-microservice

# Build frontend and nginx
cd front && npm ci && npm run build
cp -r dist/* ../backend/nginx/frontend-build/
docker build -t nginx:latest backend/nginx
```

3. **Deploy to Minikube:**
```bash
cd backend
kubectl apply -k kubernetes/base
```

4. **Access services:**
```bash
minikube service nginx -n default
```

### Production Kubernetes Deployment

Production deployment is automated via GitHub Actions but can be done manually:

```bash
# Create secrets
cat > backend/kubernetes/base/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  POSTGRES_PASSWORD: "your-password"
  PGADMIN_DEFAULT_PASSWORD: "your-password"
  MINIO_ROOT_PASSWORD: "your-password"
  SECRET_KEY: "your-secret-key"
  OPENROUTER_KEY: "your-openrouter-key"
EOF

# Deploy to production
kubectl apply -k backend/kubernetes/overlays/production
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for automated CI/CD with three main workflows:

### 1. CI Pipeline (`ci.yml`)
**Trigger:** Pull requests to `dev` branch

**Process:**
1. **Change Detection:** Identifies which services were modified
2. **Build:** Builds Docker images for changed services
3. **Service Tests:** Runs isolated tests for each modified service
4. **E2E Tests:** Runs full integration tests if services pass
5. **Status Check:** Aggregates results for PR merge decision

### 2. CD Docker Push (`cd_docker_push.yml`)
**Trigger:** Pushes to `dev` branch

**Process:**
1. **Change Detection:** Identifies modified services
2. **Version Bump:** Increments version for each service
3. **Build & Push:** Builds and pushes images to Docker Hub
4. **Update Manifests:** Updates Kubernetes staging manifests with new versions
5. **Deploy to Staging:** Automatically deploys to staging Kubernetes cluster

### 3. CD Production (`cd_prod.yml`)
**Trigger:** Pushes to `main` branch

**Process:**
1. **Sync Tags:** Copies image tags from staging to production manifests
2. **Deploy to Production:** Deploys to production Kubernetes cluster
3. **Verification:** Waits for pods and shows deployment status

### Branch Strategy

```
main (production)
  ↑
  └── dev (staging)
        ↑
        └── feature/fix branches → PR to dev
```

## 📚 API Documentation

Each service provides OpenAPI (Swagger) documentation:

- **Builder Service:** http://localhost/devops/api/builder-service/docs
- **Catalogue Service:** http://localhost/devops/api/catalogue-service/docs
- **Chatbot Service:** http://localhost/devops/api/chatbot-service/docs

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secure_password` |
| `POSTGRES_DB` | Database name | `sitebuilder` |
| `PGADMIN_DEFAULT_EMAIL` | PGAdmin login email | `admin@example.com` |
| `PGADMIN_DEFAULT_PASSWORD` | PGAdmin login password | `admin_password` |
| `MINIO_ROOT_USER` | MinIO root username | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | MinIO root password | `minio_password` |
| `SECRET_KEY` | JWT signing secret | `your-secret-key-here` |
| `OPENROUTER_KEY` | OpenRouter API key | `sk-or-v1-...` |

### GitHub Actions Secrets

For CI/CD pipelines, configure these secrets in GitHub repository settings:

- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token
- `KUBE_CONFIG` - Base64-encoded kubeconfig for Kubernetes access
- All environment variables listed above

## 🗂 Database Schema

### User Management
- **User**: User accounts with authentication
- **Site**: User-owned websites with unique string IDs

### Catalogue Management
- **Category**: Product categories within a site
- **Product**: Products with name, description, and price
- **Variant**: Product variants with individual stock levels

### Relationships
```sql
User 1→N Site
Site 1→N Category
Category 1→N Product
Product 1→N Variant
```

## 🤝 Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Write/update tests
4. Create a PR to `dev`
5. Wait for CI to pass
6. Get code review approval
7. Merge to `dev` (auto-deploys to staging)
8. After verification, merge to `main` (auto-deploys to production)

## 📝 License

This project is part of a DevOps learning initiative.

## 📞 Support

For issues and questions:
- Check the `/instructions` folder for detailed guides
- Check the `/tutos` folder for specific tutorials
- Review service logs using `bash backend/script/some_logs.sh`
- Check OpenAPI documentation for API details

---

**Built with ❤️ using modern DevOps practices**
