FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
# Uruchamiaj jako nieuprzywilejowany 'node' (istnieje w obrazie), spójnie z
# frontendem. Własność /app daje mu prawo zapisu do runtime-cache Strapi
# (.strapi) i logów; ogranicza skutki ewentualnego RCE w zależnościach.
# UWAGA: wolumen uploadów (anovastudio_uploads_prod → /app/public/uploads) jest
# na serwerze rootowy, więc przy pierwszym deployu z tym obrazem trzeba go raz
# przejąć na uid node (1000), inaczej Media Library straci prawo zapisu:
#   docker run --rm -v anovastudio_uploads_prod:/u alpine chown -R 1000:1000 /u
RUN chown -R node:node /app
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
