import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddressForm from './AddressForm';
import { setAppConfig } from '@/shared/lib/app-config';

describe('AddressForm (Multi-país)', () => {
    it('renderiza etiquetas y opciones de Guatemala (GT) por defecto', () => {
        setAppConfig({
            paisCodigo: 'GT',
            paisNombre: 'Guatemala',
        });

        render(
            <AddressForm
                onSubmit={vi.fn().mockResolvedValue({ success: true })}
                onCancel={vi.fn()}
                saving={false}
            />
        );

        expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/municipio/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/\+502/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Guatemala')).toBeInTheDocument();

        // El select de departamento debe tener opciones de Guatemala
        const estadoSelect = screen.getByLabelText(/departamento/i) as HTMLSelectElement;
        expect(screen.getByRole('option', { name: 'Guatemala' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Sacatepéquez' })).toBeInTheDocument();

        // Al seleccionar un departamento, se cargan los municipios correspondientes
        fireEvent.change(estadoSelect, { target: { value: 'Sacatepéquez' } });

        expect(screen.getByRole('option', { name: 'Antigua Guatemala' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Jocotenango' })).toBeInTheDocument();
    });

    it('renderiza etiquetas y opciones de Chile (CL) cuando el perfil es Chile', () => {
        setAppConfig({
            paisCodigo: 'CL',
            paisNombre: 'Chile',
        });

        render(
            <AddressForm
                onSubmit={vi.fn().mockResolvedValue({ success: true })}
                onCancel={vi.fn()}
                saving={false}
            />
        );

        expect(screen.getByLabelText(/región/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/comuna/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/\+56/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Chile')).toBeInTheDocument();

        // El select de región debe tener opciones de Chile
        const regionSelect = screen.getByLabelText(/región/i) as HTMLSelectElement;
        expect(screen.getByRole('option', { name: 'Región Metropolitana de Santiago' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Valparaíso' })).toBeInTheDocument();

        // Al seleccionar Región Metropolitana, se cargan comunas de Santiago
        fireEvent.change(regionSelect, { target: { value: 'Región Metropolitana de Santiago' } });

        expect(screen.getByRole('option', { name: 'Providencia' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Las Condes' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Santiago' })).toBeInTheDocument();
    });

    it('envía los datos del formulario correctamente en submit', async () => {
        setAppConfig({
            paisCodigo: 'CL',
            paisNombre: 'Chile',
        });

        const onSubmitMock = vi.fn().mockResolvedValue({ success: true });

        render(
            <AddressForm
                onSubmit={onSubmitMock}
                onCancel={vi.fn()}
                saving={false}
            />
        );

        fireEvent.change(screen.getByLabelText(/alias/i), { target: { value: 'Depto Santiago' } });
        fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '+56912345678' } });
        fireEvent.change(screen.getByLabelText(/calle/i), { target: { value: 'Av. Providencia 1234' } });

        const regionSelect = screen.getByLabelText(/región/i);
        fireEvent.change(regionSelect, { target: { value: 'Región Metropolitana de Santiago' } });

        const comunaSelect = screen.getByLabelText(/comuna/i);
        fireEvent.change(comunaSelect, { target: { value: 'Providencia' } });

        fireEvent.click(screen.getByRole('button', { name: /agregar dirección/i }));

        expect(onSubmitMock).toHaveBeenCalledWith(expect.objectContaining({
            alias: 'Depto Santiago',
            telefono: '+56912345678',
            direccion: 'Av. Providencia 1234',
            estado: 'Región Metropolitana de Santiago',
            ciudad: 'Providencia',
            pais: 'Chile',
        }));
    });
});

