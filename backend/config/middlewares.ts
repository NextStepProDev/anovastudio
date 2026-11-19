import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  // CORS narrowed to the production domains + localhost for development. The frontend
  // consumes the API on the server side (server components / the image optimizer), so
  // the narrowing does not touch page rendering — it only protects against cross-origin
  // calls from a browser. Overridable with CORS_ORIGINS (comma-separated).
  {
    name: 'strapi::cors',
    config: {
      origin: (process.env.CORS_ORIGINS ?? 'https://anovastudio.pl,https://www.anovastudio.pl,http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
    },
  },
  // 'strapi::poweredBy' removed on purpose — we do not reveal X-Powered-By: Strapi.
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
