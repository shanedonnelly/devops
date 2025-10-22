

# Construire et lancer les services
docker-compose up --build

# Tester le builder service
curl http://localhost:8000/

# Tester l'API OpenAPI
firefox http://localhost:8000/docs
firefox http://localhost:8001/docs