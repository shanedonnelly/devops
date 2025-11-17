cd ./catalogue-service/
docker build -f Dockerfile.test -t catalogue-service:test .
docker run --rm catalogue-service:test
docker rmi catalogue-service:test
cd ../