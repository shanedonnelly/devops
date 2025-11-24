## Ancien contexte (à prendre avec pincette)

Avant on était sur docker compose (voir docker-compose.yaml), et un script (start_docker_compose.sh) mais c'est un peu plus obsolète mais ça te permettra de bien comprendre l'app et aussi de comprendre les urls possibles. 

## Bilan du projet dans son infrastructure K3s

Donc je constate que on a une redondance et donc une mauvaise utilisation de certaines choses. 
Actuellement, on construit une image nginx dans lequel on place le build static. (ça on garde), hors on y place aussi une configuration nginx (voir nginx.conf) qui fait reverse proxy. ça fonctionné en local avec minikube (voir start.sh), mais en prod on était en pending car le cluster k3s (que je ne peux modifier), a par défaut traefik natif (voir terminal)  comme reverse proxy / load balancer. Une solution par copilot qui a contourné le souci était d'ajouter un ingress (voir ingress.yaml) qui a fonctionné (voir start_staging.sh). hors c'est pas propre. car c'est traekfik vers nginx. donc c'est simple, on va utiliser nginx juste comme serveur web (servir le front static). et ingress traefik natif pour le reste (LB + Reverse Proxy). Je précise que même si ça a fonctionné, on avait un souci de CORS. 

## Nouveaux ajouts

J'aimerai également qu'on mette directement en place https (automatique) et redirection de http vers https, uniquement si tu penses que c'est possible avec le cluster actuel. Pour cela je t'ai fourni un tuto medium, mais c'est que pour t'inspirer, si tu sais faire sans fais le. 

Egalement je vais ajouter le nom de domaine : shanify.shane-donnelly.fr, je vais le rediriger vers l'ip, et il faudra bien sûr que ça mène à /devops/shanify (le front).

J'aimerai avoir 2 namespaces, 2 environnements (prod et staging), et donc je vais ajouter une redirection vers le même host mais depuis shanify-test.shane-donnelly.fr . ce seront les mêmes mais le faut pas de confusion. 

## Ce que je souhaite

Que tu me donnes les modifications minimales à apporter et / ou fichier à ajouter. il faut qu'on soit sûr que ça fonctionne. Il faut être sur aussi que CORS va fonctionné. 
Si il te manque des fichiers cruciaux ( a priori t'as tout), alors tu t'arrêtes et tu me les demandes en plus. 

Donne aussi des indications d'étapes à réaliser après avoir modifier les fichiers. 
