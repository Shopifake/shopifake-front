# Kubernetes Deployment Guide for Shopifake Frontend

This guide explains how to deploy the Shopifake frontend with subdomain support on k3s.

## Prerequisites

- k3s cluster running
- kubectl configured to access your cluster
- Docker image built and pushed to a registry
- DNS configured with wildcard subdomain support (see DNS Configuration section)

## DNS Configuration

Before deploying, you need to configure DNS for the subdomain structure.

### Option 1: Multi-level subdomain (Recommended)
For URLs like `my-site.shopifake.axel-trepout.fr`:

1. Create an A record for `shopifake.axel-trepout.fr` pointing to your k3s node IP
2. Create a wildcard A record for `*.shopifake.axel-trepout.fr` pointing to the same IP

Example DNS records:
```
shopifake.axel-trepout.fr          A    192.168.1.100
*.shopifake.axel-trepout.fr        A    192.168.1.100
```

**Important**: Set `VITE_BASE_DOMAIN=shopifake.axel-trepout.fr` in your environment variables.

### Option 2: Direct subdomain
For URLs like `my-site.axel-trepout.fr`:

1. Create an A record for `axel-trepout.fr` pointing to your k3s node IP
2. Create a wildcard A record for `*.axel-trepout.fr` pointing to the same IP

Example DNS records:
```
axel-trepout.fr          A    192.168.1.100
*.axel-trepout.fr        A    192.168.1.100
```

**Important**: Set `VITE_BASE_DOMAIN=axel-trepout.fr` in your environment variables.

## HTTP Configuration

The ingress is configured for HTTP only (no TLS). If you want to add HTTPS later, you can:

1. Install cert-manager for Let's Encrypt certificates
2. Add TLS configuration to the ingress
3. Update Traefik annotations to use `websecure` entrypoint

## Building and Pushing Docker Image

1. Build the Docker image:
```bash
docker build -t your-registry/shopifake-frontend:latest .
```

2. Push to your registry:
```bash
docker push your-registry/shopifake-frontend:latest
```

3. Update `deployment.yaml` with your image registry path.

## Deployment Steps

1. Update the image reference in `deployment.yaml`:
```yaml
image: your-registry/shopifake-frontend:latest
```

2. Apply the manifests:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

3. Verify the deployment:
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

## Ingress Controller

k3s comes with Traefik by default. If you're using a different ingress controller (like nginx), update the `ingress.yaml`:

- Change `ingressClassName` from `traefik` to `nginx`
- Update annotations accordingly

## Environment Variables

Since this is a static build, environment variables need to be set at **build time**. You can pass them during the Docker build:

### Build-time Environment Variables

```bash
docker build \
  --build-arg VITE_BASE_DOMAIN=shopifake.axel-trepout.fr \
  --build-arg VITE_API_URL=http://api.example.com \
  -t your-registry/shopifake-frontend:latest .
```

Update your `Dockerfile` to accept build args:
```dockerfile
ARG VITE_BASE_DOMAIN
ARG VITE_API_URL
ENV VITE_BASE_DOMAIN=$VITE_BASE_DOMAIN
ENV VITE_API_URL=$VITE_API_URL
```

### Required Variables

- `VITE_BASE_DOMAIN`: The base domain for subdomain routing (e.g., `shopifake.axel-trepout.fr` or `axel-trepout.fr`)
- `VITE_API_URL`: (Optional) The backend API URL

**Important**: The `VITE_BASE_DOMAIN` must match your DNS configuration and ingress rules.

## Troubleshooting

### Subdomains not working

1. Check DNS propagation:
```bash
# For multi-level subdomains
dig shopifake.axel-trepout.fr
dig test.shopifake.axel-trepout.fr

# For direct subdomains
dig axel-trepout.fr
dig test.axel-trepout.fr
```

2. Check ingress logs:
```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik
```

3. Verify ingress configuration:
```bash
kubectl describe ingress shopifake-frontend-ingress
```

### Site not loading

1. Check pod status:
```bash
kubectl get pods -l app=shopifake-frontend
kubectl logs -l app=shopifake-frontend
```

2. Check service endpoints:
```bash
kubectl get endpoints shopifake-frontend-service
```

3. Test service directly:
```bash
kubectl port-forward service/shopifake-frontend-service 8080:80
# Then visit http://localhost:8080
```

## API Endpoint Requirement

The frontend expects an API endpoint to fetch sites by slug:
```
GET /api/sites/slug/{slug}
```

Make sure your backend API implements this endpoint and returns a `SiteResponse` object.

## Scaling

To scale the deployment:
```bash
kubectl scale deployment shopifake-frontend --replicas=3
```

## Updates

To update the deployment:
```bash
# Update the image
kubectl set image deployment/shopifake-frontend frontend=your-registry/shopifake-frontend:v1.1.0

# Or apply updated manifests
kubectl apply -f k8s/deployment.yaml
```

