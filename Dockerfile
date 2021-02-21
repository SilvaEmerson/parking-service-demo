FROM node:13-alpine AS base

COPY . /api

WORKDIR /api

RUN apk update &&\
    apk upgrade &&\
    apk add --no-cache git &&\
    npm i

CMD npm start 
