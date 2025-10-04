#!/usr/bin/env bash
set -o errexit

# install server deps
npm install

# move to client
cd ../client
# install client deps including devDependencies
npm install --include=dev
npm run build

# back to server
cd ../server
