FROM node:18-slim

RUN apt-get update && apt-get install -y openssl libssl-dev gnupg sudo
RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

ARG BASE_DIR

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY ${BASE_DIR}/package.json .
COPY prisma ./prisma/

RUN npm install

COPY ${BASE_DIR} .

EXPOSE 3000

RUN npx prisma generate

RUN npm run build

CMD npm run prisma:up && npm start
