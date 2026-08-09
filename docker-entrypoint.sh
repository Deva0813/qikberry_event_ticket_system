#!/bin/sh
set -e

MYSQL_HOST="${MYSQL_HOST:-mysql}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"

echo "Waiting for MySQL at ${MYSQL_HOST}:${MYSQL_PORT}..."
until nc -z "${MYSQL_HOST}" "${MYSQL_PORT}"; do
  sleep 1
done
echo "MySQL is up."

echo "Waiting for MongoDB at ${MONGO_HOST}:${MONGO_PORT}..."
until nc -z "${MONGO_HOST}" "${MONGO_PORT}"; do
  sleep 1
done
echo "MongoDB is up."

echo "Generating Prisma clients..."
pnpm prisma:generate

echo "Applying MySQL migrations..."
pnpm prisma migrate deploy --schema=prisma/mysql/schema.prisma

echo "Pushing MongoDB schema..."
pnpm prisma db push --schema=prisma/mongodb/schema.prisma --skip-generate --accept-data-loss

echo "Starting app: $*"
exec "$@"