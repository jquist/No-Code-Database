FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
RUN npm run build


FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/build .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]