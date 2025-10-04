#!/usr/bin/env bash 
set -o errexit 
npm install 
cd ../client 
npm install 
npm run build 
cd ../server 
