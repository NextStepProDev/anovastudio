FROM node:26-alpine

# Wszystko poniżej dzieje się jako nieuprzywilejowany 'node' (uid 1000, istnieje
# w obrazie), spójnie z frontendem. Własność /app daje mu prawo zapisu do
# runtime-cache Strapi (.strapi) i logów; ogranicza skutki ewentualnego RCE
# w zależnościach.
# Przełączamy użytkownika PRZED instalacją, a nie po niej. Wcześniejsze
# `RUN chown -R node:node /app` na końcu Dockerfile'a dopisywało do obrazu drugą,
# pełną kopię node_modules — 1 GB na każdy build, przez co obraz urósł z 1,6 GB
# do 3,08 GB i wspólnie z brakiem sprzątania zapchał 45-gigabajtowy dysk serwera.
# UWAGA: wolumen uploadów (anovastudio_uploads_prod → /app/public/uploads) jest
# na serwerze rootowy, więc przy pierwszym deployu z tym obrazem trzeba go raz
# przejąć na uid node (1000), inaczej Media Library straci prawo zapisu:
#   docker run --rm -v anovastudio_uploads_prod:/u alpine chown -R 1000:1000 /u
WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
# Cache npm trafiłby do obrazu (~200 MB) — kasujemy go w tej samej warstwie,
# bo osobne RUN już go z obrazu nie usunie.
RUN npm ci && npm cache clean --force

COPY --chown=node:node . .
RUN npm run build

# Bez `npm prune --omit=dev`: usunięcie plików w późniejszej warstwie nie zmniejsza
# wcześniejszej, więc obraz by od tego tylko urósł. Zmierzone — devDependencies to
# i tak 31 MB (typescript + @types) z 793 MB node_modules; realne cięcie wymagałoby
# budowania wieloetapowego, co przy 2,5% zysku się nie opłaca.
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
