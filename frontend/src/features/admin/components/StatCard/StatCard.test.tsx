import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
    it('renderiza el título, ícono y valor numérico formateado', () => {
        const expected = (1250).toLocaleString('es-MX');

        render(<StatCard title="Usuarios" value={1250} icon="👤" color="#3b82f6" />);

        expect(screen.getByText('Usuarios')).toBeInTheDocument();
        expect(screen.getByText('👤')).toBeInTheDocument();
        expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('renderiza valores de tipo texto directamente', () => {
        render(<StatCard title="Revenue total" value="$4,500.00" />);

        expect(screen.getByText('Revenue total')).toBeInTheDocument();
        expect(screen.getByText('$4,500.00')).toBeInTheDocument();
    });

    it('muestra skeleton en lugar del valor cuando loading es true', () => {
        render(<StatCard title="Órdenes" value={42} loading />);

        expect(screen.getByText('Órdenes')).toBeInTheDocument();
        expect(screen.queryByText('42')).not.toBeInTheDocument();
    });
});
