# syntax=docker/dockerfile:1.7

FROM node:22-alpine@sha256:6413217a1da8d8c2a2b7b9d5c1a8d95f42d9d9ff3c6d6d5aa9d57c0209f8a9d6 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine@sha256:0f1b5a7831a5e7d0d5f1e3200d8ceeb1d0f5c9cb6dbf95c53db44c7667b6ef4c AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
