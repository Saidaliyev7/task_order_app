import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { federation } from '@module-federation/vite';
import analyzer from 'vite-bundle-analyzer';
import remoteBlueprints from '@shared/config/remotes.config';

export default defineConfig(({ mode }) => {
  const shouldAnalyze = process.env.ANALYZE === 'true';
  const env = loadEnv(mode, process.cwd(), '');
  const getRemoteEntry = (envKey: string, defaultPort: number) => {
    const devUrl = `http://localhost:${defaultPort}/remoteEntry.js`;
    const prodUrl = `http://localhost:${defaultPort + 1100}/assets/remoteEntry.js`;
    return env[envKey] || (mode === 'development' ? devUrl : prodUrl);
  };
  const remotes = remoteBlueprints.reduce<
    Record<string, { type: 'module'; name: string; entry: string }>
  >((acc, blueprint) => {
    acc[blueprint.name] = {
      type: 'module',
      name: blueprint.name,
      entry: getRemoteEntry(blueprint.envKey, blueprint.defaultDevPort)
    };
    return acc;
  }, {});

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes,
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
          'react-router-dom': { singleton: true },
          '@shared/ui': { singleton: true },
          '@shared/config': { singleton: true },
          '@shared/utils': { singleton: true }
        },
        dts: false
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
      port: 3000
    },
    preview: {
      host: '0.0.0.0',
      port: 4300
    },
    build: {
      target: 'esnext',
      manifest: true,
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id) {
            const matchers = [
              { name: 'react', pattern: /node_modules\/(react|react-dom)\// },
              { name: 'router', pattern: /node_modules\/react-router-dom\// },
              { name: 'mui', pattern: /node_modules\/@mui\// },
              { name: 'emotion', pattern: /node_modules\/@emotion\// },
              { name: 'federation', pattern: /node_modules\/@module-federation\// }
            ];
            for (const matcher of matchers) {
              if (matcher.pattern.test(id)) {
                return matcher.name;
              }
            }
            if (id.includes('packages/shared-ui')) {
              return 'shared-ui';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
