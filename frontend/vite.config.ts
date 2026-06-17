import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            include: ['src/**/*.{test,spec}.{ts,tsx}'],
            css: true,
            env: {
                VITE_API_URL: env.VITE_API_URL || 'http://localhost:8080',
            },
            coverage: {
                provider: 'v8',
                reporter: ['text', 'html'],
                exclude: ['src/test/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
            },
        },
    };
});
