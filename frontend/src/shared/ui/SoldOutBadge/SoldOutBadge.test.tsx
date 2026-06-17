import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SoldOutBadge } from './SoldOutBadge';

describe('SoldOutBadge', () => {
    it('muestra el texto Agotado', () => {
        render(<SoldOutBadge />);
        expect(screen.getByText('Agotado')).toBeInTheDocument();
    });

    it('aplica placement start cuando se indica', () => {
        const { container } = render(<SoldOutBadge placement="start" />);
        const badge = container.querySelector('span');
        expect(badge?.className).toMatch(/placementStart/);
    });
});
