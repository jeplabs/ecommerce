import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCheckout: vi.fn(),
    };
});

import { useCheckout } from '@/app/providers';
import PickupBranchSelector from './PickupBranchSelector';
import { makeCheckoutMock } from '@/test/checkoutMock';

const useCheckoutMock = vi.mocked(useCheckout);

describe('PickupBranchSelector', () => {
    it('muestra las sucursales disponibles desde el contexto', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ selectedBranchId: null }) as never
        );
        render(<PickupBranchSelector />);

        expect(screen.getByText('Sucursal de retiro')).toBeInTheDocument();
        expect(screen.getByText('Tienda Centro')).toBeInTheDocument();
        expect(screen.getByText('Tienda Zona 10')).toBeInTheDocument();
        expect(screen.getByText(/Tel:\s*\+502 2345-6789/)).toBeInTheDocument();
        expect(screen.getByText(/Lun-Vie: 9:00-18:00/)).toBeInTheDocument();
    });

    it('permite al cliente seleccionar conscientemente una sucursal', () => {
        const setSelectedBranchId = vi.fn();
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ selectedBranchId: null, setSelectedBranchId }) as never
        );
        render(<PickupBranchSelector />);

        const zona10 = screen.getByRole('radio', { name: /Tienda Zona 10/ });
        expect(zona10).not.toBeChecked();

        fireEvent.click(zona10);

        expect(setSelectedBranchId).toHaveBeenCalledWith(2);
    });

    it('muestra estado de carga mientras se obtienen las sucursales', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ loadingBranches: true, sucursales: [] }) as never
        );
        render(<PickupBranchSelector />);

        expect(screen.getByText(/Cargando sucursales disponibles/i)).toBeInTheDocument();
    });

    it('muestra estado vacío si no hay sucursales disponibles', () => {
        useCheckoutMock.mockReturnValue(
            makeCheckoutMock({ loadingBranches: false, sucursales: [] }) as never
        );
        render(<PickupBranchSelector />);

        expect(
            screen.getByText(/No hay sucursales disponibles para retiro en este momento/i)
        ).toBeInTheDocument();
    });
});
