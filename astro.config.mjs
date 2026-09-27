// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { figureCaptions } from './src/plugins/figure-captions.mjs';
import serviceWorker from './src/integrations/service-worker.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://pacomolina.dev',
  base: '/',
  // serviceWorker(): generates dist/sw.js (offline support) after the build.
  // Preact with `compat`: the components are written against the React API
  // (hooks, lucide-react, simple-icons…) and run unchanged on Preact, which
  // is ~40KB lighter gzipped than React + ReactDOM.
  integrations: [preact({ compat: true }), serviceWorker()],
  markdown: {
    // `![alt](./img.webp "Caption")` → <figure> + <figcaption> in blog posts.
    processor: satteri({ hastPlugins: [figureCaptions] }),
  },
  vite: {
    plugins: [tailwindcss()],
    // Bundle the React-API icon packages into the server builds too, so the
    // react → preact/compat aliases apply while prerendering (left external,
    // they import the real React and their icons fail to render). Setting
    // noExternal replaces the list @astrojs/preact would add, so React's own
    // entry points are repeated here.
    environments: Object.fromEntries(
      ["ssr", "prerender"].map((name) => [
        name,
        {
          resolve: {
            noExternal: [
              "react",
              "react-dom",
              "react-dom/test-utils",
              "react/jsx-runtime",
              "lucide-react",
              "@icons-pack/react-simple-icons",
            ],
          },
        },
      ])
    ),
  },
});
