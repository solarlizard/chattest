FROM node:16.14.0 as builder

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
COPY src /app/src

RUN yarn

FROM node:16.14.0

WORKDIR /app

COPY --from=builder /app /app

RUN yarn

COPY entrypoint.sh /

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]