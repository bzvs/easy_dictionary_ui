# Сборка фронта
FROM node:20-alpine AS builder
WORKDIR /app

ARG REACT_APP_API_URL=http://localhost:8080
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Продакшен: nginx раздаёт статику
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
  }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
