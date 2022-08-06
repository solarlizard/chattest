#!/bin/bash

./stop.sh

set -e

docker-compose -f ./docker-compose-server.yml up --build

./stop.sh
