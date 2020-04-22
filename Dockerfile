FROM node:10-alpine as BUILD
LABEL maintainer="luca.decarne@unito.it"

RUN mkdir -p /opt/server/ccserver
WORKDIR /opt/server/ccserver
COPY package*.json ./
RUN apk update && apk upgrade && apk add --no-cache bash git openssh python make g++
RUN npm install
COPY . .
RUN mv config.js.template config.js

FROM node:10-alpine
COPY --from=BUILD /opt/server/ccserver .
RUN  npm install pm2 -g
EXPOSE 3000
ARG environment
ENV NODE_ENV=$environment
CMD ["npm", "start"]
