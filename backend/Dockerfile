FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
