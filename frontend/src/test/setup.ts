import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetDynamicAuthUsers } from './msw/fixtures/auth-registry';
import { resetDynamicAddresses } from './msw/fixtures/address-registry';
import { resetDynamicCart } from './msw/fixtures/cart-registry';
import { resetDynamicOrders } from './msw/fixtures/orders-registry';
import { resetDynamicProfile } from './msw/fixtures/profile-registry';
import { resetMockOrderIds } from './msw/fixtures/orders';
import { server } from './msw/server';

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    resetDynamicAddresses();
    resetDynamicOrders();
    resetDynamicProfile();
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    resetDynamicAuthUsers();
    resetDynamicCart();
    resetDynamicAddresses();
    resetDynamicOrders();
    resetDynamicProfile();
    resetMockOrderIds();
    localStorage.clear();
});

afterAll(() => {
    server.close();
});
