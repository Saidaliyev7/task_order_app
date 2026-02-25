import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      'orders/Module': fileURLToPath(new URL('./tests/mocks/ordersModule.tsx', import.meta.url)),
      'inventory/Module': fileURLToPath(
        new URL('./tests/mocks/inventoryModule.tsx', import.meta.url)
      ),
      'meals/Module': fileURLToPath(new URL('./tests/mocks/mealsModule.tsx', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['apps/**/*.{test,spec}.{ts,tsx}', 'packages/**/*.{test,spec}.{ts,tsx}']
  }
});
