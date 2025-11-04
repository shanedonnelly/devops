---
applyTo: '**'
---
# This instruction goal 

This file provides the app technical stack and for which app functionality each technology is used + api description for each service.

## Dev Environment and Production Environment
To run the project as developer we will only use Docker Compose to run all services and dependencies all at once using docker-compose.yaml file.

We will also simulate production environment using minikube to run all services and dependencies using Kubernetes manifests. minikube will have to build the docker images locally to run the services.

For production we will use Kubernetes manifests to run all services and dependencies.

# Technologies used in the project

## Data

We will use one PostgreSQL as main database for all services.
We will use Prisma as main ORM to connect to the database and perform database operations.
The main service (builder service) will contain the logic to create and manage the database schema using Prisma migrations.
If the database is empty the builder service will create the schema using Prisma migrate deploy command.
There is only one prisma schema that will be used by all services.

## Frontend

We will use React with mostly native React library, espacially for the frontend logic.

The initial React project will be created externally using "Figma Make" which provides an AI generated React project from little prompts. The benefit of it is the creativity and the styling of the app. You as copilot have better coding capabilities so you will improve the code quality and structure.
You might want to check for unstable codes, responsiveness, accessibility and overall code quality.
You will match the frontend API calls to the backend API specifications and any kind of models and data. The source of truth will always be the backend API specifications, not the frontend.

## Backend

We will use Python with FastAPI framework for the backend services.
A microservice architecture is used but lightly, so some features are grouped.
Each microservice is a folder containing app.py(controllers and app init), models.py (containing the required models and dtos) requirements.txt, Dockerfile and schema.prisma files(the same for all services, even tho the builder service is the only one migrating the schema).

# Those are the services and their functionalities:

## builder-service

This is the main service. It provides the API for login/register, user sites management and site building management.

### Routes
- POST /api/register : register a new user (with username and password)
- POST /api/login : login a user (with username and password) with JWT token response
- DELETE /api/users/{id} : delete a user by id (so the JWT token is required)
- GET /api/sites : get all sites for the logged in user (so the JWT token is required)
- DELETE /api/sites/{id} : delete a site by id for the logged in user (so the JWT token is required)
- POST /api/sites : create a new site for the logged in user (so the JWT token is required) : body params : site_name 
- PUT /api/sites/{id} : update a site by id for the logged in user (so the JWT token is required)
- PUT /api/sites/{id}/config : this will receive the site configuration that will be stored as json in the minio storage. body params : css_template : string , title : string, description : string, contact_text : string.(this route is secured, so the JWT token is required, you need to be the owner of the site to update its config)
- GET /api/sites/{string_id}/config : this will return the site configuration json stored in minio for the given site id. (this route is public, no JWT token required)

## catalogue-service
This services serves 2 purposes, but the frontend React component that will consume this service will be generic and reusable for both purposes.
The idea is that the main route will return in the entire catalogue regarding the concerned site. the catalogue response contains : the list of categories, the list of products (attached to a category) and a list of variants (attached to a product and that stores the stock number). if the user is the site owner, the component will have a boolean flag is_owner = true, so the component will show the management options (add/edit/delete) for categories, products and variants.
If the user is looking at the catalogue as a visitor from the public site, the is_owner flag will be false and no management options will be shown.
### Routes
- GET /api/sites/{site_string_id}/catalogue : get the entire catalogue for the given site id. (public route, no JWT token required)
- PUT /api/sites/{site_string_id}/catalogue : update the entire catalogue for the given site id. (JWT token required, site owner only)
//deleting the entire catalogue is done by the builder-service when deleting a site.

## other technologies

### Minio

Use to stored site configuration json files.
Later on, it will also be used to store catalogue product images.
Within the full docker-compose and Kubernetes manifests, we want access to the Minio web interface to manage files at /api/minio. You will be provided a Stack Overflow solution link to do so.

### OpenAPI

Used to document the backend APIs automatically from FastAPI routes and models.
I want acces to the OpenAPI docs for each service within the full docker-compose and Kubernetes manifests at /api/service-name/docs.

### Adminer

Used to manage the PostgreSQL database visually.
I want access to the Adminer web interface within the full docker-compose and Kubernetes manifests at /api/adminer.


