import { render, type RenderOptions } from '@testing-library/react';
import { AppProviders } from '@/app/providers/AppProviders';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type RenderWithShopProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
    routerProps?: MemoryRouterProps;
};

export function renderWithShopProviders(
    ui: ReactElement,
    options: RenderWithShopProvidersOptions = {}
) {
    const { routerProps, ...renderOptions } = options;

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter {...routerProps}>
                <AppProviders>{children}</AppProviders>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}
