docker compose logs -f builder-service
docker compose logs -f catalogue-service
kubectl logs -f deployment/builder-service
kubectl logs -f deployment/catalogue-service