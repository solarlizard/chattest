#!/bin/bash

./../stop.sh

set -e

docker-compose up --build -d

yarn test

./../stop.sh
