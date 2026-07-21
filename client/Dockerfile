FROM node:alpine

ARG NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "run", "dev"]