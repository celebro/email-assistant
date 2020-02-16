# node:13.8-alpine
FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i --only=production

COPY src ./src

VOLUME ["data"]

CMD ["node", "src/index.js"]
