import { mockProduct, mockSoldOutProduct } from '../../src/test/msw/fixtures/products';

describe('Detalle de producto', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
    });

    it('navega al detalle desde el catálogo', () => {
        cy.visit('/catalogo');
        cy.wait('@getProducts');
        cy.get('input[placeholder="Buscar productos..."]').should('have.value', '');

        cy.get(`button[aria-label="Ver detalles de ${mockProduct.nombre}"]`)
            .scrollIntoView()
            .click();

        cy.location('pathname').should('eq', `/producto/${mockProduct.slug}`);
        cy.contains('h1', mockProduct.nombre).should('be.visible');
        cy.contains(`SKU: ${mockProduct.sku}`).should('be.visible');
    });

    it('muestra producto agotado sin permitir añadir al carrito', () => {
        cy.visit(`/producto/${mockSoldOutProduct.slug}`);
        cy.wait('@getProductBySlug', { timeout: 10000 });
        cy.contains('h1', mockSoldOutProduct.nombre).should('be.visible');
        cy.contains('✕ Sin stock').should('be.visible');
        cy.contains('button', 'Sin Stock').should('be.disabled');
    });

    it('muestra la descripción formateada sin inyección HTML', () => {
        cy.visit(`/producto/${mockProduct.slug}`);
        cy.wait('@getProductBySlug', { timeout: 10000 });
        cy.get('[class*="fullDescription"]').scrollIntoView().should('be.visible');
    });
});
