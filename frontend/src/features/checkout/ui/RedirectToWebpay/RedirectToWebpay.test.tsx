import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RedirectToWebpay from './RedirectToWebpay';

describe('RedirectToWebpay', () => {
    let submitSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        submitSpy = vi
            .spyOn(HTMLFormElement.prototype, 'submit')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('muestra la marca y el mensaje de redirección', () => {
        render(<RedirectToWebpay urlRedireccion="https://webpay3g.test/frontend/x" token="tok_abc" />);

        expect(screen.getByText('Webpay Plus')).toBeInTheDocument();
        expect(
            screen.getByText('Redirigiendo a Webpay Plus para completar tu pago…')
        ).toBeInTheDocument();
    });

    it('arma un form POST con token_ws y lo envía automáticamente', () => {
        render(<RedirectToWebpay urlRedireccion="https://webpay3g.test/frontend/x" token="tok_abc" />);

        const form = screen.getByTestId('webpay-redirect-form');
        expect(form).toHaveAttribute('method', 'POST');
        expect(form).toHaveAttribute('action', 'https://webpay3g.test/frontend/x');

        const input = form.querySelector('input');
        expect(input).not.toBeNull();
        expect(input).toHaveAttribute('type', 'hidden');
        expect(input).toHaveAttribute('name', 'token_ws');
        expect(input).toHaveValue('tok_abc');

        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
});
