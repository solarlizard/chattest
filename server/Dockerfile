FROM node:16.14.0 as builder

WORKDIR /app
COPY tsconfig.json /app
COPY tsconfig.compile.json /app
COPY package.json /app
COPY yarn.lock /app
COPY gulpfile.js /app
COPY src /app/src
COPY gulp /app/gulp

RUN yarn

FROM node:16.14.0

WORKDIR /app

COPY --from=builder /app/build/dist /app

RUN yarn

COPY entrypoint.sh /

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]