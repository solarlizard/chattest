#!/bin/bash

./stop.sh

set -e

docker-compose up --build

./stop.sh
