import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['verbose', 'html'],
    coverage: {
      exclude: [
        'html/**',
        'dist/**',
        'vitest.config.ts',
        'vitest',
        'index.ts',
        'eslint.config.mjs',
      ],
      reportsDirectory: 'html/coverage',
      reporter: [
        ['html-spa', {subdir: 'spa'}],
        ['html', {subdir: 'html'}],
      ],
      provider: 'v8',
    },
  },
});
