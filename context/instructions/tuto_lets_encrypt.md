Configure HTTPS in Traefik with cert-manager and Let’s Encrypt
Faturrahman
Faturrahman
5 min read
·
Sep 10, 2023

Press enter or click to view image in full size

Cut to the chase, this tutorial will explain how to configure HTTPS in Traefik with cert-manager and Let’s Encrypt. All manifests are available in GitHub repository. This tutorial only cover the basic, for more detailed about Traefik and cert-manager configuration, please visit their official documentation page.
Prerequisites

    Kubernetes cluster
    DNS
    Helm to install Traefik and cert-manager
    Traefik
    cert-manager

Kubernetes

In this tutorial I use EKS which is a managed Kubernetes cluster service from AWS, using Kubernetes cluster version 1.24. I will not discussed how to create EKS in this tutorial because the topic is out of scope.
DNS

I use Cloudflare to managed DNS.
Traefik

Install Traefik with Helm

    Add Traefik helm repository
    helm repo add traefik https://traefik.github.io/charts
    Install Traefik
    For each Helm installation, it is better if we specify chart version in our Helm installation. You can see list Helm chart version with this command:
    helm search repo traefik/traefik -l
    Then we can install Traefik with this command:
    helm install traefik traefik/traefik --version 23.1.0
    As of today, the latest Traefik helm chart version is 23.1.0 so I specified to that version.
    Since Traefik external IP is a public DNS with format name-1234567890.region.elb.amazonaws.com, create DNS CNAME record pointing to external IP of Traefik that we already created. Disabled proxy if using Cloudflare.

cert-manager

Install cert-manager with Helm

    Add cert-manager Helm repository
    helm repo add jetstack https://charts.jetstack.io
    Install cert-manager
    helm install cert-manager jetstack/cert-manager --version v1.12.2 --set installCRDs=true

Deployment

For deployment, I will be using NGINX as an example

apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
    - port: 80
      protocol: TCP
  selector:
    app: nginx

Expose Service

There are two Traefik resources that we can use to expose service, Ingress and IngressRoute. I’ll be using IngressRoute to expose it

apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: nginx
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`traefik.adadeeeh.com`)
      kind: Rule
      services:
        - name: nginx
          port: 80

Create IngressRoute resource and after that you can access NGINX from domain that just created. At this point we can access NGINX but only from http, the next step is to secure it so that we can access it in https.
Press enter or click to view image in full size
Create Issuer

Let’s Encrypt provide two environment for issuer, staging with https://acme-staging-v02.api.letsencrypt.org/directory and production with https://acme-v02.api.letsencrypt.org/directory. To avoid rate limit and unwanted behavior, it’s best to test first using staging environment and change to production environment later.
Get Faturrahman’s stories in your inbox

Join Medium for free to get updates from this writer.

There are two kind of issuer resources, Issuer and ClusterIssuer. The difference is that Issuer can only be use in specific namespace, while the later can be use cluster wide. I’ll be using Issuer and for the challenge I’ll be using HTTP-01

apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    email: your@email.com
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-issuer-account-key
    solvers:
      - http01:
          ingress:
            serviceType: ClusterIP
            ingressClassName: traefik

Create Certificate

There are two ways to create Certificate in cert-manager, one is to let cert-manager automatically create the Certificate and the other is to manually create certificate. This tutorial will manually creating Certificate resource.

To configure HTTPS in Traefik, first create Certificate and specify secret that just created from Certificate in Traefik. Create Certificate

apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: nginx-cert-staging
  namespace: default
spec:
  commonName: traefik.adadeeeh.com
  secretName: nginx-cert-staging
  dnsNames:
    - traefik.adadeeeh.com
  issuerRef:
    kind: Issuer
    name: letsencrypt-staging

Create IngressRoute and specify secret name that just created

apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: nginx-secure
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`traefik.adadeeeh.com`)
      kind: Rule
      services:
        - name: nginx
          port: 80
  tls:
    secretName: nginx-cert-staging

Now we can access NGINX with the domain that just created using https.
Press enter or click to view image in full size

Notice that the https is not really secure, it is expected because we use Let’s Encrypt staging environment.

To use Let’s Encrypt production environment, create another Issuer

apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: your@email.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod-issuer-account-key
    solvers:
      - http01:
          ingress:
            serviceType: ClusterIP
            ingressClassName: traefik

Create Certificate with new Issuer

apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: nginx-cert
  namespace: default
spec:
  commonName: traefik.adadeeeh.com
  secretName: nginx-cert
  dnsNames:
    - traefik.adadeeeh.com
  issuerRef:
    kind: Issuer
    name: letsencrypt-prod

If new Certificate is issued, update IngressRoute

apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: nginx-secure
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`traefik.adadeeeh.com`)
      kind: Rule
      services:
        - name: nginx
          port: 80
  tls:
    secretName: nginx-cert

Now NGINX is secured with Let’s Encrypt production environment.
Press enter or click to view image in full size
Redirect HTTP to HTTPS (Optional)

At this point, NGINX is accessible with HTTP and HTTPS. If we want to redirect HTTP request to HTTPS, first create Traefik Middleware

apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: https-redirectscheme
spec:
  redirectScheme:
    permanent: true
    scheme: https

Configure HTTP IngressRoute to use the newly created Middleware

apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: nginx
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`traefik.adadeeeh.com`)
      kind: Rule
      services:
        - name: nginx
          port: 80
      middlewares:
        - name: https-redirectscheme

Now HTTP request is redirected to HTTPS.
Clean Up

    Uninstall cert-manager helm uninstall cert-manager
    Uninstall Traefik helm uninstall traefik
    Delete Kubernetes cluster