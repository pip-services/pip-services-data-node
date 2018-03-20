#!/bin/bash

COMPONENT=$(grep -m1 name package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
VERSION=$(grep -m1 version package.json | tr -d '\r' | awk -F: '{ print $2 }' | sed 's/[", ]//g')
TAG="v${VERSION}"

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e
set -o pipefail

# Login to npm
if [ -z "${NPM_USER}" ]; then
npm login
else
# npm login <<!
# $NPM_USER
# $NPM_PASS
# $NPM_EMAIL
# !
npm-cli-login
fi

npm publish
