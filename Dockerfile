FROM node:20 AS builder
WORKDIR /app

# Build arguments for environment variables
ARG VITE_BASE_DOMAIN
ARG VITE_API_URL

# Set environment variables for build
ENV VITE_BASE_DOMAIN=$VITE_BASE_DOMAIN
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:stable
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
