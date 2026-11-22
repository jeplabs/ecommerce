import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import CategoriasNav from '../CategoriasNav/CategoriasNav';
import Footer from '../Footer/Footer';
import styles from './ShopLayout.module.css';

type ShopLayoutProps = {
    showCategoriasNav?: boolean;
};

/**
 * Shell de la tienda: cabecera, categorías (opcional) y pie.
 * El contenido de cada ruta se renderiza en `<Outlet />`.
 */
export default function ShopLayout({ showCategoriasNav = true }: ShopLayoutProps) {
    return (
        <div className={styles.layout}>
            <header className={styles.headerGroup}>
                <Navbar />
                {showCategoriasNav ? <CategoriasNav /> : null}
            </header>
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
