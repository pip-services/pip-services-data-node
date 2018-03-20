#!/bin/bash

COMPONENT=$(grep -m1 name package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
VERSION=$(grep -m1 version package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
IMAGE="pipdevs/${COMPONENT}:${VERSION}-test"

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e
set -o pipefail

# Workaround to remove dangling images
docker-compose -f ./docker/docker-compose.test.yml down

export IMAGE
docker-compose -f ./docker/docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test

# Workaround to remove dangling images
docker-compose -f ./docker/docker-compose.test.yml down