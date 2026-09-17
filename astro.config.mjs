// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { rehypeFigure, rehypeTableWrap } from './src/plugins/rehype-content.mjs';

// https://astro.build/config
export default defineConfig({
  // Dominio definitivo, deciso il 28 agosto 2026: il sito prende
  // www.gorgolab.it e la wiki storica viene dismessa. Da qui dipendono sitemap,
  // URL canonici e anteprime social, quindi finché il dominio non è collegato
  // le anteprime pubblicate su *.pages.dev si dichiarano già come www.
  site: 'https://www.gorgolab.it',
  integrations: [mdx(), sitemap()],
  // I caratteri sono serviti dal sito stesso: caricarli da Google Fonts
  // mandava l'IP di ogni visitatore a Google al primo caricamento, e il sito
  // promette di non contattare terzi finché il visitatore non lo chiede.
  // I file vengono dai pacchetti @fontsource installati, non da una CDN: la
  // build non dipende dalla rete e le versioni stanno nel package-lock.
  // Solo il sottoinsieme latino, che copre l'italiano.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { weight: 700, style: 'normal', src: ['@fontsource/poppins/files/poppins-latin-700-normal.woff2'] },
          { weight: 800, style: 'normal', src: ['@fontsource/poppins/files/poppins-latin-800-normal.woff2'] },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { weight: '300 700', style: 'normal', src: ['@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2'] },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          { weight: '100 800', style: 'normal', src: ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'] },
        ],
      },
    },
  ],
  image: {
    // srcset + sizes generati automaticamente per <Image /> e per le immagini markdown
    layout: 'constrained',
    responsiveStyles: true,
    // Le anteprime dei video YouTube si scaricano a build time e si servono
    // dal sito: vedi src/components/Video.astro.
    domains: ['i.ytimg.com'],
  },
  vite: {
    build: {
      // Gli allegati dei progetti non vanno mai inlinati come data: URI:
      // devono restare file veri e scaricabili, anche quando sono piccoli.
      assetsInlineLimit: (file) =>
        /\.(pdf|zip|stl|step|stp|3mf|svg|dxf|ino|kicad_pro|sch|csv|txt|gcode)$/i.test(file)
          ? false
          : undefined,
    },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    rehypePlugins: [rehypeFigure, rehypeTableWrap],
  },
});
