# Stage 1: Base avec dépendances
FROM python:3.12-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Test (CI) - cette étape exécute les tests
FROM base AS test

WORKDIR /app

# Copier tout le code source pour les tests
COPY . .

# Générer le client Prisma
RUN prisma generate

# Exécuter les tests - la build échouera si les tests échouent
RUN pytest test_builder_service.py -v --tb=short --cov=. --cov-report=term-missing || exit 1

# Stage 3: Production - seulement si les tests passent
FROM base AS production

WORKDIR /app

# Copier uniquement les fichiers nécessaires en production
COPY app.py .
COPY models.py .
COPY schema.prisma .

# Générer le client Prisma
RUN prisma generate

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["sh", "-c", "prisma db push && uvicorn app:app --host 0.0.0.0 --port 8000"]