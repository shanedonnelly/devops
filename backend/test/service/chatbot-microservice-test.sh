cd ./chatbot-microservice/
docker build -f Dockerfile.test -t chatbot-microservice:test .
docker run --rm chatbot-microservice:test
docker rmi chatbot-microservice:test
cd ../