#!/bin/bash

./stop.sh

set -e

docker-compose down --rmi all

docker-compose -f ./docker-compose-latest.yml up --build

./stop.sh
