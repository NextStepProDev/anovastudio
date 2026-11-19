FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Server-side only in our code, but allow overriding at build time just in case
ARG NEXT_PUBLIC_STRAPI_URL=http://strapi:1337
ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL
# Base URL for sitemap/robots/canonicals — CI passes the real domain once known
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Let the image optimizer fetch from Strapi over the private compose network
ENV NEXT_IMAGE_ALLOW_INTERNAL=1
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
# Run as the unprivileged 'node' user (present in the image). --chown gives it ownership
# of the files, including write access to the image optimizer's cache (.next/cache).
# It limits the effects of a possible RCE in dependencies.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# The cache directory MUST exist in the image and belong to node. Production mounts a
# named volume here (anovastudio_image_cache_prod), and Docker creates the mount point as
# root if it does not find it in the image — then the image optimizer loses write access
# and recomputes photos on every request. An existing directory makes the volume inherit
# its owner.
RUN mkdir -p /app/.next/cache && chown -R node:node /app/.next
USER node
EXPOSE 3000
CMD ["node", "server.js"]
