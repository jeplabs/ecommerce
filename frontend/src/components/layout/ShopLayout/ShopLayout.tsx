import { Outlet } from 'react-router-dom';
import Navbar from '@/widgets/layout/Navbar/Navbar';
import CategoriasNav from '@/widgets/layout/CategoriasNav/CategoriasNav';
import Footer from '@/widgets/layout/Footer/Footer';
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
            <Navbar />
            {showCategoriasNav ? <CategoriasNav /> : null}
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
