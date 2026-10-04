import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.thbiomedic.com',
  base: '/',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
