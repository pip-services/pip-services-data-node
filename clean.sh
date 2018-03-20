#!/bin/bash

COMPONENT=$(grep -m1 name package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
VERSION=$(grep -m1 version package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
BUILD_IMAGE="pipdevs/${COMPONENT}:${VERSION}-build"
TEST_IMAGE="pipdevs/${COMPONENT}:${VERSION}-test"

rm -rf ./node_modules
rm -rf ./obj

docker rmi $BUILD_IMAGE --force
docker rmi $TEST_IMAGE --force
docker image prune --force