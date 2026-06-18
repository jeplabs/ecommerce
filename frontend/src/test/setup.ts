import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetDynamicAuthUsers } from './msw/fixtures/auth-registry';
import { server } from './msw/server';

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    resetDynamicAuthUsers();
    localStorage.clear();
});

afterAll(() => {
    server.close();
});
