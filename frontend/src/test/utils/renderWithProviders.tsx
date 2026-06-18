import { render, type RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/app/providers/AuthProvider';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
    routerProps?: MemoryRouterProps;
};

export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
    const { routerProps, ...renderOptions } = options;

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter {...routerProps}>
                <AuthProvider>{children}</AuthProvider>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}
