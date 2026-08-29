import { defineConfig } from 'cypress';

export default defineConfig({
    // No usamos Cypress.env(); desactiva la API legacy expuesta al browser.
    allowCypressEnv: false,
    e2e: {
        baseUrl: 'http://localhost:5173',
        supportFile: 'cypress/support/e2e.ts',
        specPattern: 'cypress/e2e/**/*.cy.ts',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
    },
});
