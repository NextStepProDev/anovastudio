import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  // CORS zawężony do domen produkcyjnych + localhost do developmentu. Frontend
  // konsumuje API po stronie serwera (server components / optymalizator obrazów),
  // więc zawężenie nie dotyka renderu strony — chroni tylko przed cross-origin
  // wywołaniami z przeglądarki. Nadpisywalne przez CORS_ORIGINS (lista po przecinku).
  {
    name: 'strapi::cors',
    config: {
      origin: (process.env.CORS_ORIGINS ?? 'https://anovastudio.pl,https://www.anovastudio.pl,http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
    },
  },
  // 'strapi::poweredBy' usunięty celowo — nie ujawniamy X-Powered-By: Strapi.
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
