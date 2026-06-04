import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { ProductCatalog } from '@/widgets/layout/ProductCatalog';
import './Catalogo.css';

export default function Catalogo() {

    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" }
    ];

    return (
        <div className="container">
            <div className="container-header">
                <h1>Catalogo</h1>
                <Breadcrumbs items={breadcrumbs} className="container-breadcrumbs" />
            </div>
            <ProductCatalog />
        </div>
    );
}