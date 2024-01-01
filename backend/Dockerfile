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

EXPOSE 3000

CMD [ "node", "dist/main" ]
