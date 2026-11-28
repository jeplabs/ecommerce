import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { setAccessToken } from '@/lib/auth-token-store';
import { resetDynamicProducts } from '@/test/msw/fixtures/products-registry';
import type { CategoryApi } from '@/features/catalog';
import { AdminCategoriesTable } from '../AdminCategoriesTable';
import { CategoryModalForm, generarSlugPreview } from '../CategoryModalForm';
import AdminCategoriesView from './AdminCategoriesView';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/categorias']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

function seedAdminToken() {
    setAccessToken(mockAdminAuthTokenResponse.token);
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('AdminCategoriesView', () => {
    beforeEach(() => {
        resetDynamicProducts();
        seedAdminToken();
    });

    it('renderiza el título, estadísticas y las categorías del mock', async () => {
        renderWithProviders(<AdminCategoriesView />);

        expect(screen.getByRole('heading', { name: /Gestión de Categorías/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\+ Nueva Categoría Raíz/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
            expect(screen.getByText('Audio')).toBeInTheDocument();
        });

        expect(screen.getByText(/Total:/i)).toBeInTheDocument();
        expect(screen.getByText(/Raíces:/i)).toBeInTheDocument();
    });

    it('abre el modal para crear categoría raíz al pulsar el botón', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const newBtn = screen.getByRole('button', { name: /\+ Nueva Categoría Raíz/i });
        fireEvent.click(newBtn);

        expect(screen.getByRole('heading', { name: /Nueva categoría/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre de la categoría/i)).toBeInTheDocument();
    });

    it('abre el modal en modo edición con los datos precargados', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const editBtns = screen.getAllByRole('button', { name: /Editar/i });
        fireEvent.click(editBtns[0]!);

        expect(screen.getByRole('heading', { name: /Editar categoría/i })).toBeInTheDocument();
        const input = screen.getByLabelText(/Nombre de la categoría/i) as HTMLInputElement;
        expect(input.value).toBe('Electrónica');
    });

    it('muestra advertencia de bloqueo si se intenta eliminar una categoría con hijas', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        // Electrónica tiene subcategoría Audio, su botón eliminar debe abrir el modal con advertencia
        const deleteBtns = screen.getAllByRole('button', { name: /Eliminar/i });
        fireEvent.click(deleteBtns[0]!);

        expect(screen.getByText(/Acción bloqueada/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Eliminar definitivamente/i })).toBeDisabled();
    });

    it('muestra diagnóstico inline y enlace a productos ante 409 CATEGORIA_CON_PRODUCTOS al eliminar Audio', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Audio')).toBeInTheDocument();
        });

        // La fila 0 es Electrónica, la fila 1 es Audio (sin hijas pero con 2 productos en MSW)
        const deleteBtns = screen.getAllByRole('button', { name: /^Eliminar$/i });
        fireEvent.click(deleteBtns[1]!);

        const confirmBtn = screen.getByRole('button', { name: /Eliminar definitivamente/i });
        expect(confirmBtn).not.toBeDisabled();
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(/2 productos asociados/i);
        });

        const reassignLink = screen.getByRole('link', {
            name: /Ver y reasignar productos de esta categoría/i,
        });
        expect(reassignLink).toHaveAttribute('href', '/admin/products?categoriaId=2');
    });

    it('generarSlugPreview recorta guiones extremos igual que Categoria.generarSlug en backend', () => {
        expect(generarSlugPreview('Laptops (Gamer)')).toBe('laptops-gamer');
        expect(generarSlugPreview('---Cámaras & Lentes---')).toBe('camaras-lentes');
        expect(generarSlugPreview('!!!')).toBe('');
    });

    it('deshabilita + Hija en el nivel 5 de profundidad y marca opciones que superan 5 niveles en el Select', () => {
        const deepTree: CategoryApi[] = [
            {
                id: 10,
                nombre: 'Nivel 1',
                slug: 'nivel-1',
                parentId: null,
                subcategorias: [
                    {
                        id: 20,
                        nombre: 'Nivel 2',
                        slug: 'nivel-2',
                        parentId: 10,
                        subcategorias: [
                            {
                                id: 30,
                                nombre: 'Nivel 3',
                                slug: 'nivel-3',
                                parentId: 20,
                                subcategorias: [
                                    {
                                        id: 40,
                                        nombre: 'Nivel 4',
                                        slug: 'nivel-4',
                                        parentId: 30,
                                        subcategorias: [
                                            {
                                                id: 50,
                                                nombre: 'Nivel 5',
                                                slug: 'nivel-5',
                                                parentId: 40,
                                                subcategorias: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        render(
            <AdminCategoriesTable
                categories={deepTree}
                searchFilter="Nivel"
                onAddSubcategory={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        const addChildBtns = screen.getAllByRole('button', { name: /\+ Hija/i });
        expect(addChildBtns).toHaveLength(5);
        expect(addChildBtns[3]).not.toBeDisabled(); // Nivel 4 puede tener hija (Nivel 5)
        expect(addChildBtns[4]).toBeDisabled(); // Nivel 5 ya alcanzó el tope

        render(
            <CategoryModalForm
                isOpen={true}
                onClose={vi.fn()}
                allCategories={deepTree}
                onSave={vi.fn()}
            />
        );

        const level5Option = screen.getByRole('option', {
            name: /Nivel 5 \(Límite 5 niveles\)/i,
        }) as HTMLOptionElement;
        expect(level5Option.disabled).toBe(true);
    });
});
