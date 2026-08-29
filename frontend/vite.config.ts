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
        optimizeDeps: {
            include: [],
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    },
                },
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
                include: [
                    'src/features/checkout/ui/**',
                    'src/features/checkout/model/**',
                    'src/features/checkout/lib/**',
                    'src/entities/checkout/api/**',
                    'src/entities/order/api/**',
                    'src/entities/shipping/model/**',
                    'src/pages/checkout/**',
                    'src/pages/checkout-success/**',
                    'src/widgets/checkout/**',
                    'src/shared/lib/**',
                    'src/shared/api/**',
                ],
                exclude: [
                    'src/main.tsx',
                    'src/test/**',
                    '**/*.test.{ts,tsx}',
                    '**/*.spec.{ts,tsx}',
                    '**/*.module.css',
                    '**/*.css',
                    '**/index.ts',
                    '**/types.ts',
                ],
                thresholds: {
                    lines: 90,
                    statements: 90,
                    branches: 85,
                    functions: 90,
                },
            },
        },
    };
});
