FROM node:26-alpine

# Everything below runs as the unprivileged 'node' (uid 1000, present in the image),
# consistent with the frontend. Owning /app gives it write access to Strapi's runtime
# cache (.strapi) and logs; it limits the effects of a possible RCE in dependencies.
# We switch user BEFORE the install, not after it. The former `RUN chown -R node:node
# /app` at the end of the Dockerfile added a second, full copy of node_modules to the
# image — 1 GB per build, which grew the image from 1.6 GB to 3.08 GB and, together
# with no cleanup, filled the server's 45 GB disk.
# NOTE: the uploads volume (anovastudio_uploads_prod → /app/public/uploads) is
# root-owned on the server, so on the first deploy with this image it has to be taken
# over to the node uid (1000) once, or the Media Library loses write access:
#   docker run --rm -v anovastudio_uploads_prod:/u alpine chown -R 1000:1000 /u
WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
# The npm cache would end up in the image (~200 MB) — we delete it in the same layer,
# because a separate RUN would not remove it from the image any more.
RUN npm ci && npm cache clean --force

COPY --chown=node:node . .
RUN npm run build

# No `npm prune --omit=dev`: deleting files in a later layer does not shrink an
# earlier one, so the image would only grow from it. Measured — devDependencies are
# only 31 MB (typescript + @types) of 793 MB of node_modules; a real cut would need a
# multi-stage build, which for a 2.5% gain is not worth it.
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
