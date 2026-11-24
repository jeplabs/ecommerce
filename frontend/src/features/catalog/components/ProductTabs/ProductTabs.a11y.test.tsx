import { render, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { ProductTabs } from './ProductTabs';
import { mockProduct } from '@/test/msw/fixtures/products';

describe('Accesibilidad — ProductTabs (Paso 3: Detalle de Producto)', () => {
    it('la pestaña de descripción cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(<ProductTabs producto={mockProduct} />);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('la pestaña de características técnicas cumple con las normas de accesibilidad', async () => {
        const { container, getByRole } = render(<ProductTabs producto={mockProduct} />);

        const specsTab = getByRole('tab', { name: /características técnicas/i });
        fireEvent.click(specsTab);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
