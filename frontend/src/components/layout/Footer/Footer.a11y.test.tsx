import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Accesibilidad — Footer (Paso 1: Layout Público)', () => {
    it('el componente Footer cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(<Footer />);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
