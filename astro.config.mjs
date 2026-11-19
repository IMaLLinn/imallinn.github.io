import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { site } from './src/config/site';

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (url) => !/\/(categories|collections|tags)(\/|$)/.test(new URL(url).pathname) })],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      smartypants: false,
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      langAlias: { arkts: 'typescript', wxml: 'xml', wxss: 'css', 'x86-64': 'asm' },
    },
  },
  vite: { plugins: [tailwind()] },
  devToolbar: { enabled: false },
});
