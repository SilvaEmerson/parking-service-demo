FROM node:14.16-alpine

COPY . /api

WORKDIR /api

RUN apk update &&\
    apk upgrade &&\
    apk add --no-cache git &&\
    npm i

CMD npm start 
