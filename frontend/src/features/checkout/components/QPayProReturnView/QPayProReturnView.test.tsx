import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QPayProReturnView } from './QPayProReturnView';

vi.mock('../QPayProReturn/QPayProReturn', () => ({
    default: () => <div data-testid="qpaypro-return">QPayPro Return Component</div>,
}));

describe('QPayProReturnView', () => {
    it('renderiza el header de retorno y el componente QPayProReturn', () => {
        render(
            <MemoryRouter>
                <QPayProReturnView />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Retorno QPayPro' })).toBeInTheDocument();
        expect(screen.getByTestId('qpaypro-return')).toBeInTheDocument();
    });
});
