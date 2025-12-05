// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), vue()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['marko-pi.student.utwente.nl']
    },
    preview: {
      allowedHosts: ['marko-pi.student.utwente.nl']
    },
  }
});