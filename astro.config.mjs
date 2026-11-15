// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { codeTheme, codeTransformers } from './src/lib/code.ts';
import rehypeSidenotes from './src/lib/rehype-sidenotes.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://off-the-happy-path.vercel.app',
  output: 'static',
  // Every public page; the 404 is left out.
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) })],
  markdown: {
    // The remark/rehype pipeline, so posts get GFM footnotes and local rehype plugins.
    processor: unified({ rehypePlugins: [rehypeSidenotes] }),
    shikiConfig: {
      theme: codeTheme,
      transformers: codeTransformers(),
    },
  },
});
