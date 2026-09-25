// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { figureCaptions } from './src/plugins/figure-captions.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://pacomolina.dev',
  base: '/',
  integrations: [react()],
  markdown: {
    // `![alt](./img.webp "Caption")` → <figure> + <figcaption> in blog posts.
    processor: satteri({ hastPlugins: [figureCaptions] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
