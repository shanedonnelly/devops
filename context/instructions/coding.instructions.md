---
applyTo: '**'
---
# This instruction goal

This file provides instruction about how to code and python specific guidelines.

## Python general guidelines

In requirements.txt files do not specify versions for packages unless absolutely necessary. 
Every function (especially controllers) should be try/catch wrapped to handle exceptions gracefully. try the best to explicitly catch exceptions rather than using a general Exception catch.
Use the logger instead of print statements.
Print 3 logs : one at the start of the try block, one error logging for exceptions and one at the end of the try block.
Use f-strings for string formatting.
Try to type most of the code.
Write one one-line comment to specify each function
Write other comments inside the code only for complicated and hard to understand lines.
The code should be minimalist and clean, but structured.

## Project specific guidelines for Python files
You will connect to the database using prisma. Use the prisma client to perform database operations.
You will write one prisma schema that will be copied to each service. 
When the builder service will connect to the database using prisma, it will do a update like operation. if the schema match the tables, we do nothing, if db empty we 
Every routes should be auto added to the OpenAPI docs like already in place. 

## Dockerfile guidelines
Use python:3.12-slim as base image.
For postgres use postgres:latest. 

## Compose and Kubernetes guidelines
The docker compose and Kubernetes manifests should always have the exact same configuration and behavior.

## Shell scripts guidelines
If asked to write a script, write a bash script and a bat script using basic required commands, curl, docker, minikube. 
docker-compose command doesnt exist anymore, use docker compose. 

## Tutorials guidelines
You will be given some tutorials from Medium to get inspired for the coding style and some implementation details. 



