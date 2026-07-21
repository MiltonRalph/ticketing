FROM node:alpine

WORKDIR /app
COPY package.json ./

#include this to prevent mongoMemoryServer from downloading in the cloud 
ENV MONGOMS_DISABLE_POSTINSTALL=1

RUN npm install
COPY ./ ./

CMD ["npm", "start"]