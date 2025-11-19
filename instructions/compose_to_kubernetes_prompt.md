# Prompt à suivre

## But 

Le but est simple, passé d'une orchestration docker compose fonctionnelle à une orchestration kubernetes fonctionnelle. Cette migration doit etre dans la philosophie kubernetes et profiter de celle ci. 

## Context

Tu possèdes en contexte le docker-compose.yaml ainsi que la configuration nginx (dans notre cas qui fait reverse proxy). ces deux fichiers ont été murement travaillé pour établir l'orchestration, et le compose et déjà indépendant du projet root du moment ou on a les images. 
ces images seront après notre ci/cd déjà présentes. 
voici leurs id :
shanedonnelly34/catalogue-service
shanedonnelly34/builder-service
shanedonnelly34/nginx
shanedonnelly34/chatbot-microservice
avec comme tag latest à chaque fois à utiliser. 

je te fourni également le cd pour que tu comprennes comment elles ont été build. 

je te fourni également le Dockerfile de nginx car celui là on devra surement le modifier pour enlever l'usage comme reverse proxy. 

enfin, important, je te fourni une analyse en md de notre migration par Gemini, uniquement pour t'insipirer. 

## Résultat attendu

1) Dis moi quelle petite modification je vais devoir faire sur le dockerfile de nginx. 

2) Donne moi l'ensemble 
