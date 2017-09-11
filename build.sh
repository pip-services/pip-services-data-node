#!/bin/bash

#COMPONENT=`node -e "console.log(require('./package.json').name);"`
#VERSION=`node -e "console.log(require('./package.json').version);"`
#COMPONENT=`basename "$PWD"`
#VERSION=`npm view ${COMPONENT} version`

COMPONENT=$(grep -m1 name package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
VERSION=$(grep -m1 version package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
IMAGE="pipdevs/${COMPONENT}:${VERSION}-build"
CONTAINER="${COMPONENT}"

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e
set -o pipefail

# Remove build files
rm -rf ./obj

# Build docker image
docker build -f Dockerfile.build -t ${IMAGE} .

# Create and copy compiled files, then destroy
docker create --name ${CONTAINER} ${IMAGE}
docker cp ${CONTAINER}:/app/obj ./obj
docker rm ${CONTAINER}