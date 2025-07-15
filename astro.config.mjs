import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import lightTheme from './src/styles/my-shiki-theme-light.json';
import darkTheme from './src/styles/my-shiki-theme-dark.json';

export default defineConfig({
  prefetch: true,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: lightTheme,
        dark: darkTheme
      }
    }
  },
});