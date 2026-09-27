// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { figureCaptions } from './src/plugins/figure-captions.mjs';
import { mermaidDiagrams } from './src/plugins/mermaid-diagrams.mjs';
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
    // `![alt](./img.webp "Caption")` → <figure> + <figcaption> in blog posts;
    // ```mermaid blocks → their pre-rendered SVG (scripts/diagrams/).
    processor: satteri({ hastPlugins: [figureCaptions, mermaidDiagrams] }),
    // Mermaid blocks reach mermaidDiagrams as plain text, not highlighted.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'mermaid'] },
  },
  vite: {
    plugins: [tailwindcss()],
    // `astro build` gets its own Vite cache: sharing node_modules/.vite with
    // a running `astro dev` rewrote the dev server's pre-bundled deps, and
    // open pages then failed to hydrate ("error loading dynamically
    // imported module …/.vite/deps/react.js").
    cacheDir: process.argv.includes('build') ? 'node_modules/.vite-build' : 'node_modules/.vite',
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
