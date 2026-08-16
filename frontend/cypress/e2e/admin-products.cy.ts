describe('Admin productos', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.stubShopApi();
        cy.stubAuthApi();
        cy.stubAuthenticatedApi();
        cy.stubAdminApi();
        cy.loginAsAdmin();
    });

    it('lista productos y crea uno nuevo', () => {
        cy.visit('/admin/products');
        cy.wait('@getProducts');
        cy.contains('h1', 'Productos').should('be.visible');
        cy.contains('Producto de prueba').should('be.visible');

        cy.contains('button', 'Agregar Producto').click();
        cy.url().should('include', '/admin/products/new');
        cy.contains('h1', 'Crear Producto').should('be.visible');

        cy.get('input[name="nombre"]').type('Teclado E2E', { force: true });
        cy.get('input[name="sku"]').type('E2E-KB-001', { force: true });
        cy.get('textarea[name="descripcion"]').type('Teclado inalámbrico para pruebas E2E', { force: true });
        cy.get('input[name="price"]').clear().type('89.99', { force: true });
        cy.get('input[name="stock"]').clear().type('12', { force: true });
        cy.get('select[name="categoria"]').select('1');
        cy.get('select[name="subcategoria"]').select('2');

        cy.get('input[type="url"]').type('https://placehold.co/400x400/png', { force: true });
        cy.contains('button', 'Agregar URL').click({ force: true });

        cy.contains('button', 'Agregar Producto').click({ force: true });
        cy.wait('@createProduct');

        cy.url().should('include', '/admin/products');
        cy.get('body').should('contain.text', 'Teclado E2E');
    });
});
