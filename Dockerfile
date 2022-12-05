FROM node:18 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run postinstall
RUN npm run build

FROM nginx:1.23.1-alpine AS deploy

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build .

ENTRYPOINT [ "nginx", "-g", "daemon off;"]