cd ./builder-service/
docker build -f Dockerfile.test -t builder-service:test .
docker run --rm builder-service:test
docker rmi builder-service:test
cd ../