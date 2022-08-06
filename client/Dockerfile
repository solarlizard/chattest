FROM node:16.14.0 as builder

WORKDIR /app
COPY tsconfig.json /app
COPY package.json /app
COPY yarn.lock /app
COPY src /app/src
COPY public /app/public

RUN yarn

FROM nginx:1.23.1-alpine

WORKDIR /app

COPY --from=builder /app/build /usr/share/nginx/html
