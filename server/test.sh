#!/bin/bash

./../stop.sh

set -e

docker-compose -f ./docker-compose-test.yml up --build -d

yarn test

./../stop.sh
