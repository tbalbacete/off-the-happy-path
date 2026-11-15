// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { codeTheme, codeTransformers } from './src/lib/code.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://off-the-happy-path.vercel.app',
  output: 'static',
  markdown: {
    // The remark/rehype pipeline, so posts get GFM footnotes and local rehype plugins.
    processor: unified(),
    shikiConfig: {
      theme: codeTheme,
      transformers: codeTransformers(),
    },
  },
});
