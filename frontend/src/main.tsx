import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/bebas-neue/latin-400.css';
import '@/app/styles';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('No se encontró el elemento #root');
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>
);
