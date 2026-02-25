import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { federation } from '@module-federation/vite';
import analyzer from 'vite-bundle-analyzer';

export default defineConfig(({ mode }) => {
  const exposeEntry = './src/remote-entry.tsx';
  const isDev = mode === 'development';
  const base = isDev ? 'http://localhost:3201/' : '/';
  const shouldAnalyze = process.env.ANALYZE === 'true';

  return {
    base,
    plugins: [
      react(),
      federation({
        name: 'orders',
        filename: 'remoteEntry.js',
        exposes: {
          './Module': exposeEntry
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
          'react-router-dom': { singleton: true },
          '@shared/ui': { singleton: true },
          '@shared/config': { singleton: true },
          '@shared/utils': { singleton: true }
        },
        dev: true
      }),
      ...(shouldAnalyze
        ? [
            analyzer({
              analyzerMode: 'static',
              openAnalyzer: true
            })
          ]
        : [])
    ],
    server: {
      host: '0.0.0.0',
      port: 3201,
      origin: 'http://localhost:3201'
    },
    preview: {
      host: '0.0.0.0',
      port: 4301
    },
    build: {
      target: 'esnext',
      modulePreload: false,
      minify: mode === 'production'
    }
  };
});
