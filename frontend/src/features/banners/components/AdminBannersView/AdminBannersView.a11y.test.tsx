import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { AdminBannersView } from './AdminBannersView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicBanners } from '@/test/msw/fixtures/banners-registry';

describe('Accesibilidad — AdminBannersView, Modales y Tabla de Banners', () => {
  beforeEach(() => {
    resetDynamicBanners();
    setAccessToken(mockAdminAuthTokenResponse.token);
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('has_session', '1');
    localStorage.setItem('rol', 'ROLE_ADMIN');
  });

  it('cumple con WCAG 2.1 AA en la vista principal con tabla de banners', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/admin/banners']}>
        <AppProviders>
          <AdminBannersView />
        </AppProviders>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /gestión de banners/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Tecnología de Vanguardia')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('cumple con WCAG 2.1 AA cuando se abre el modal de crear banner', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/banners']}>
        <AppProviders>
          <AdminBannersView />
        </AppProviders>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nuevo banner/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /nuevo banner/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const results = await axe(dialog);
    expect(results).toHaveNoViolations();
  });

  it('cumple con WCAG 2.1 AA cuando se abre el modal de confirmación de eliminación', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/banners']}>
        <AppProviders>
          <AdminBannersView />
        </AppProviders>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tecnología de Vanguardia')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar banner/i });
    fireEvent.click(deleteButtons[0]);

    const deleteDialog = await screen.findByRole('dialog', { name: /eliminar banner/i });
    expect(deleteDialog).toBeInTheDocument();

    const results = await axe(deleteDialog);
    expect(results).toHaveNoViolations();
  });
});
