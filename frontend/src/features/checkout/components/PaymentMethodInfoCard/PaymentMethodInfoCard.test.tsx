import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PaymentMethodInfoCard from './PaymentMethodInfoCard';

describe('PaymentMethodInfoCard', () => {
    it('renderiza solo el título cuando no hay props opcionales', () => {
        const { container } = render(<PaymentMethodInfoCard title="Webpay Plus" />);

        expect(screen.getByText('Webpay Plus')).toBeInTheDocument();
        expect(container.querySelector('ul')).toBeNull();
        expect(container.querySelector('p')).toBeNull();
    });

    it('renderiza badge, descripción, lista de características y children', () => {
        render(
            <PaymentMethodInfoCard
                title="Transferencia"
                badgeText="Sin comisión"
                description="Paga directamente desde tu banco"
                features={['Validación en 24h', 'Envío inmediato al confirmar']}
            >
                <div>Detalle adicional</div>
            </PaymentMethodInfoCard>
        );

        expect(screen.getByText('Transferencia')).toBeInTheDocument();
        expect(screen.getByText('Sin comisión')).toBeInTheDocument();
        expect(screen.getByText('Paga directamente desde tu banco')).toBeInTheDocument();
        expect(screen.getByText('Validación en 24h')).toBeInTheDocument();
        expect(screen.getByText('Envío inmediato al confirmar')).toBeInTheDocument();
        expect(screen.getByText('Detalle adicional')).toBeInTheDocument();
    });
});
