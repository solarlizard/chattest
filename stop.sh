#!/bin/bash

docker rm $(docker ps -qa) --force
docker volume rm $(docker volume ls | awk '{print $2}') --force