#!/bin/bash

./build.sh

set -e

docker-compose up --build

./stop.sh
