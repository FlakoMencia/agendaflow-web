FROM node:24.18.1-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@11.16.0
RUN npm ci

COPY . .

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist/agendaflow-web/browser /usr/share/nginx/html

EXPOSE 80