#!/bin/bash

./stop.sh

set -e

cd server 
yarn 

cd ..

docker-compose -f ./docker-compose-server.yml up --build

./stop.sh
