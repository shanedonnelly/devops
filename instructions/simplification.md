## Ancien contexte (à prendre avec pincette)

Avant on était sur docker compose (voir docker-compose.yaml), et un script (start_docker_compose.sh) mais c'est un peu plus obsolète mais ça te permettra de bien comprendre l'app et aussi de comprendre les urls possibles. 

## Bilan du projet dans son infrastructure K3s

Donc je constate que on a une redondance et donc une mauvaise utilisation de certaines choses. 
Actuellement, on construit une image nginx dans lequel on place le build static. (ça on garde), hors on y place aussi une configuration nginx (voir nginx.conf) qui fait reverse proxy. ça fonctionné en local avec minikube (voir start.sh), mais en prod on était en pending car le cluster k3s (que je ne peux modifier), a par défaut traefik natif (voir terminal)  comme reverse proxy / load balancer. Une solution par copilot qui a contourné le souci était d'ajouter un ingress (voir ingress.yaml) qui a fonctionné (voir start_staging.sh). hors c'est pas propre. car c'est traekfik vers nginx. donc c'est simple, on va utiliser nginx juste comme serveur web (servir le front static). et ingress traefik natif pour le reste (LB + Reverse Proxy). Je précise que même si ça a fonctionné, on avait un souci de CORS. 

## Nouveaux ajouts

J'aimerai également qu'on mette directement en place https (automatique) et redirection de http vers https, uniquement si tu penses que c'est possible avec le cluster actuel. Pour cela je t'ai fourni un tuto medium, mais c'est que pour t'inspirer, si tu sais faire sans fais le. 

Egalement je vais ajouter le nom de domaine : shanify.shane-donnelly.fr, je vais le rediriger vers l'ip, et il faudra bien sûr que ça mène à /devops/shanify (le front).

J'aimerai avoir 2 namespaces, 2 environnements (prod et staging), et donc je vais ajouter une redirection vers le même host mais depuis shanify-test.shane-donnelly.fr . ce seront les mêmes mais le faut pas de confusion. 

Pour faire proprement les choses, on va faire un fichier kustomisation en suivant cette idée de chat gpt : 

L’idée générale est d’organiser la configuration Kubernetes en deux couches grâce à Kustomize :

### idée de chatgpt, à adapter à ce qu'on a fait déjà (il sait pas que t'es intelligent et que t'as plus de contexte) il faudra bien sûr avoir les ingress qui seront bien distincts. 

1. Une couche "base" qui contient tous les fichiers communs entre les environnements.
   Exemple : deployment.yaml, service.yaml, ingress.yaml, etc.
   Ces fichiers ne contiennent rien de spécifique à un environnement : pas de namespace, pas de tag particulier.

2. Des "overlays" (un pour staging et un pour production) qui importent la base et y appliquent des modifications.
   Ces modifications sont définies dans un fichier spécial : kustomization.yaml.

Chaque overlay peut définir :
- un namespace différent
- des images différentes
- des patches supplémentaires (si besoin)
- des variables de configuration propres

Cela permet d’éviter la duplication des fichiers YAML et de garder une structure propre.

---

STRUCTURE DU PROJET :

k8s/
  base/
    deployment.yaml
    service.yaml
    kustomization.yaml
  overlays/
    staging/
      kustomization.yaml
    production/
      kustomization.yaml

---

IDÉE DU FICHIER base/kustomization.yaml :
Ce fichier liste simplement les ressources de base utilisées dans tous les environnements.

resources:
  - deployment.yaml
  - service.yaml

On n’y met aucun namespace ni patchs.

---

COMMENT ADAPTER LES FICHIERS DÉJÀ EN PLACE :
- On déplace tous les manifests actuels dans k8s/base/
- On retire des fichiers tout ce qui est spécifique à un environnement (namespace, image tag, etc.)
- On garde uniquement la version générique

Ensuite, pour chaque environnement (staging, production), on crée un dossier contenant un "kustomization.yaml" qui référence la base et définit les éléments spécifiques.

---

EXEMPLE D’OVERLAY (staging) :
namespace: staging
resources:
  - ../../base

images:
  - name: mon-image
    newTag: latest

EXEMPLE D’OVERLAY (production) :
namespace: prod
resources:
  - ../../base

images:
  - name: mon-image
    newTag: latest

---

IMAGES DIFFÉRENTES :
Dans Kustomize, on peut définir des images différentes pour chaque environnement.
Cela se fait dans la section "images:" du kustomization.yaml de chaque overlay.

Actuellement tu utilises "latest" dans les deux environnements.
Plus tard, la CI pourra automatiquement modifier les tags uniquement dans les overlays, sans toucher à la base.

Par exemple :
- staging → image:tag = dev-<sha1>
- prod → image:tag = stable-<sha1>

Mais pour l’instant, tu mets :
newTag: latest
dans les deux overlays.

---

EN RÉSUMÉ :
- base = fichiers communs, neutres
- overlay = variations pour staging/prod
- kustomization.yaml = moyen de composer et patcher les fichiers
- images peuvent être différentes par environnement sans doubler les YAML


## Ce que je souhaite

Que tu me donnes les modifications minimales à apporter et / ou fichier à ajouter. il faut qu'on soit sûr que ça fonctionne. Il faut être sur aussi que CORS va fonctionné. 
Si il te manque des fichiers cruciaux ( a priori t'as tout), alors tu t'arrêtes et tu me les demandes en plus. donne bien sur les scripts de start et stop de staging et prod.  

Donne aussi des indications d'étapes à réaliser après avoir modifier les fichiers. 
(pars du principe que les redirections DSN IP sont déjà en place).