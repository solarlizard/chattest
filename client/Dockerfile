FROM node:16.14.0 as builder

WORKDIR /app
COPY build /app

RUN yarn

FROM nginx:1.23.1-alpine

WORKDIR /app

COPY --from=builder /app /usr/share/nginx/html
