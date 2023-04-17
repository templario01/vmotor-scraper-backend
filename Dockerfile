FROM node:16.15-slim

RUN apt-get update && apt-get install -y openssl libssl-dev 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

ARG BASE_DIR

WORKDIR /app

COPY ${BASE_DIR}/package.json .
COPY prisma ./prisma/

RUN npm install

COPY ${BASE_DIR} .

EXPOSE 3000

RUN npx prisma generate

RUN npm run build

CMD npm run prisma:up && npm start

#RUN apk add --no-cache libc6-compat
#RUN apk add --no-cache openssl1.1-compat-dev

#RUN apk update && \
 #   apk add --no-cache \
  #  udev \
  #  ttf-freefont \
   # chromium \
  #  chromium-chromedriver
#RUN apk add --update --no-cache openssl1.1-compat