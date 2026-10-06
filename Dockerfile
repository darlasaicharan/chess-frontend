# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
# Inject production API URLs at build time via build args
ARG VITE_API_URL=https://chess-backend-rmkb.onrender.com/api/v1
ARG VITE_WS_URL=wss://chess-backend-rmkb.onrender.com/ws
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
RUN npm run build

# ─── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config — enables SPA routing (all paths fall back to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
