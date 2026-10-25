import type { Core } from '@strapi/strapi';

// Images a browser shows everywhere — not `image/*`. An iPhone photo copied off
// the phone as HEIC went in without an error and appeared on the site only in
// Safari; Chrome, Firefox and Edge showed an empty frame (audit, 26.10.2026).
// SVG stays allowed as before: Strapi does not clean scripts out of it, but the
// CSP Strapi sends on /uploads (`script-src 'self'`, no inline) keeps them from running.
const allowedMediaTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 25 * 1024 * 1024,
      // Tylko jeden wariant responsywny (frontend używa formats.medium, a next/image
      // i tak skaluje w locie). Domyślne 3 breakpointy potrafiły mielić sharpem
      // >60 s/zdjęcie na 1 OCPU i uploady padały timeoutem.
      breakpoints: {
        medium: 750,
      },
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
});

export default config;
