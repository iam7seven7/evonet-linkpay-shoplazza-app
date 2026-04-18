#!/bin/bash
set -eux

rm -f api/.env
cp api/.env.example api/.env

rm -f db/.env
cp db/.env.example db/.env

rm -f nginx/.env
cp nginx/.env.example nginx/.env

rm -f docker-compose.override.yml
cp docker-compose.local.yml docker-compose.override.yml
