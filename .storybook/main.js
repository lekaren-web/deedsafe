import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/postcss';

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  viteFinal: async (config) => {
    const { mergeConfig, transformWithEsbuild } = await import('vite');
    return mergeConfig(config, {
      plugins: [
        {
          // Component files are .js with JSX, as in the Next app; compile them before Vite parses them.
          name: 'deedsafe-jsx-in-js',
          enforce: 'pre',
          async transform(code, id) {
            if (!/\.js$/.test(id) || id.includes('node_modules')) return null;
            return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
          },
        },
      ],
      resolve: { alias: { 'next/link': fileURLToPath(new URL('./next-link.js', import.meta.url)) } },
      // postcss.config.mjs lists plugins by name, which only Next understands.
      css: { postcss: { plugins: [tailwindcss()] } },
      optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
      define: { 'process.env.NEXT_PUBLIC_SOLANA_NETWORK': JSON.stringify('devnet') },
    });
  },
};

export default config;
