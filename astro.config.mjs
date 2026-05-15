// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rajacuttinglaser.com',
  base: '/',

  integrations: [
    tailwind(),
    sitemap({
      serialize(item) {
        if (item.url === 'https://rajacuttinglaser.com/') {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else if (/\/jasa-/.test(item.url)) {
          item.changefreq = 'monthly';
          item.priority = 0.9;
        } else if (/\/produk\//.test(item.url)) {
          item.changefreq = 'monthly';
          item.priority = 0.9;
        } else if (/\/material-/.test(item.url)) {
          item.changefreq = 'monthly';
          item.priority = 0.8;
        } else if (/\/blog\/[^/]+/.test(item.url)) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        } else if (/\/blog\/?$/.test(item.url)) {
          item.changefreq = 'weekly';
          item.priority = 0.7;
        } else if (/\/portfolio/.test(item.url)) {
          item.changefreq = 'monthly';
          item.priority = 0.8;
        } else {
          item.changefreq = 'monthly';
          item.priority = 0.6;
        }
        return item;
      }
    }),
  ],

  output: 'static',

  // No experimental flags to ensure CI stability

  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@styles': '/src/styles',
        '@utils': '/src/utils'
      }
    }
  },

  build: {
    inlineStylesheets: 'auto',
    assets: '_assets'
  }
});