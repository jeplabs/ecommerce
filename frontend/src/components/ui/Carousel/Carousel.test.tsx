import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Carousel, { type CarouselSlide } from './Carousel';

describe('Carousel', () => {
    it('no renderiza nada cuando el arreglo de slides está vacío', () => {
        const { container } = render(<Carousel slides={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renderiza slides con enlaces internos vía React Router', () => {
        const slides: CarouselSlide[] = [
            {
                desktopSrc: 'https://test/desktop.png',
                mobileSrc: 'https://test/mobile.png',
                alt: 'Slide Interno',
                link: '/categoria/tecnologia',
            },
        ];

        render(
            <MemoryRouter>
                <Carousel slides={slides} />
            </MemoryRouter>
        );

        const link = screen.getByRole('link', { name: 'Slide Interno' });
        expect(link).toHaveAttribute('href', '/categoria/tecnologia');
        expect(link).not.toHaveAttribute('target');
    });

    it('renderiza enlaces externos con target="_blank" y rel="noopener noreferrer"', () => {
        const slides: CarouselSlide[] = [
            {
                desktopSrc: 'https://test/desktop.png',
                alt: 'Slide Externo',
                link: 'https://externo.com/promo',
            },
        ];

        render(
            <MemoryRouter>
                <Carousel slides={slides} />
            </MemoryRouter>
        );

        const link = screen.getByRole('link', { name: 'Slide Externo' });
        expect(link).toHaveAttribute('href', 'https://externo.com/promo');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renderiza slide sin enlace cuando link es nulo', () => {
        const slides: CarouselSlide[] = [
            {
                desktopSrc: 'https://test/desktop.png',
                alt: 'Slide Informativo',
                link: null,
            },
        ];

        render(
            <MemoryRouter>
                <Carousel slides={slides} />
            </MemoryRouter>
        );

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByAltText('Slide Informativo')).toBeInTheDocument();
    });

    it('utiliza desktopSrc como fallback para móviles si mobileSrc es nulo', () => {
        const slides: CarouselSlide[] = [
            {
                desktopSrc: 'https://test/desktop-only.png',
                alt: 'Slide Solo Desktop',
            },
        ];

        const { container } = render(
            <MemoryRouter>
                <Carousel slides={slides} />
            </MemoryRouter>
        );

        const source = container.querySelector('source');
        expect(source).toHaveAttribute('srcset', 'https://test/desktop-only.png');
    });
});
