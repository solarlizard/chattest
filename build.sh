#!/bin/bash

./stop.sh

set -e

cd server 
yarn 
./test.sh

cd ../client 
yarn 
yarn test

cd ..

./stop.sh
