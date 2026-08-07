import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PickupBranchSelector from './PickupBranchSelector';

describe('PickupBranchSelector', () => {
    it('muestra las sucursales disponibles', () => {
        render(<PickupBranchSelector />);

        expect(screen.getByText('Sucursal de retiro')).toBeInTheDocument();
        expect(screen.getByText('Tienda Centro')).toBeInTheDocument();
        expect(screen.getByText('Tienda Zona 10')).toBeInTheDocument();
        expect(screen.getByText('Tel: +502 2345-6789')).toBeInTheDocument();
    });

    it('selecciona una sucursal al marcarla', () => {
        render(<PickupBranchSelector />);

        const zona10 = screen.getByRole('radio', { name: /Tienda Zona 10/ });
        expect(zona10).not.toBeChecked();

        fireEvent.click(zona10);

        expect(screen.getByRole('radio', { name: /Tienda Zona 10/ })).toBeChecked();
        expect(screen.getByRole('radio', { name: /Tienda Centro/ })).not.toBeChecked();
    });
});
