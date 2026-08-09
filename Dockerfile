FROM node:24-alpine

# netcat is used by docker-entrypoint.sh to wait for mysql/mongo to accept connections
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Enable pnpm via corepack (version pinned to match devEngines in package.json)
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

ENV COREPACK_ENABLE_PROJECT_SPEC="0"

# Install deps first so this layer is cached unless package.json/lockfile change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Now bring in the rest of the source
COPY . .

# Generate both Prisma clients (mysql + mongodb) against the copied schemas
RUN pnpm prisma:generate

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "dev"]