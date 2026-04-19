import Navbar from "../components/layout/Navbar/Navbar"
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav"
import Carousel from "../components/ui/Carousel/Carousel"
import { ProductCatalog } from "../components/layout/ProductCatalog"
import Footer from "../components/layout/Footer/Footer"
import { ProductSlider } from "../components/ui/ProductSlider/ProductSlider"
import { useProducts } from "../hooks/useProducts"

const slides = [
    {
        src: 'https://media.spdigital.cl/file_upload/Desktop_Hero_1_AFPS_(2)_060a5067.webp',
        srcSet: `
            https://media.spdigital.cl/file_upload/Mobile_Hero_1_AFPS_(1)_7ed22739.webp 480w,
            https://media.spdigital.cl/file_upload/Desktop_Hero_1_AFPS_(2)_060a5067.webp 1x,
        `,
        sizes: '(max-width: 768px) 100vw, 1920px',
        alt: 'Promoción de verano',
        link: 'categoria/1',
    },
    {
        src: 'https://media.spdigital.cl/file_upload/Desktop_Hero_2_Categoria_AFPS_370eb1bc.webp',
        srcSet: `
            https://media.spdigital.cl/file_upload/Mobile_Hero_2_Categoria_AFPS_3463ef08.webp 480w,
            https://media.spdigital.cl/file_upload/Desktop_Hero_2_Categoria_AFPS_370eb1bc.webp 1x
        `,
        sizes: '(max-width: 768px) 100vw, 1920px',
        alt: 'Productos destacados',
        link: 'categoria/2',
    },
    {
        src: 'https://media.spdigital.cl/file_upload/Desktop_Hero_3_Categoria_AFPS_(1)_8475b3f5.webp',
        srcSet: `
            https://media.spdigital.cl/file_upload/Mobile_Hero_3_Categoria_AFPS_(1)_52ffd863.webp 480w,
            https://media.spdigital.cl/file_upload/Desktop_Hero_3_Categoria_AFPS_(1)_8475b3f5.webp 1x
        `,
        sizes: '(max-width: 768px) 100vw, 1920px',
        alt: 'Envío gratis',
        link: 'categoria/3',
    },
    {
        src: 'https://media.spdigital.cl/file_upload/Desktop_Hero_4_Categoria_AFPS_4b3f5338.webp',
        srcSet: `
            https://media.spdigital.cl/file_upload/Mobile_Hero_4_Categoria_AFPS_b73dff7e.webp 480w,
            https://media.spdigital.cl/file_upload/Desktop_Hero_4_Categoria_AFPS_4b3f5338.webp 1x
        `,
        sizes: '(max-width: 768px) 100vw, 1920px',
        alt: 'Promoción de verano',
        link: 'categoria/4'
    },
    {
        src: 'https://media.spdigital.cl/file_upload/Desktop_Hero_4_Categoria_AFPS-1_7dbc37a4.webp',
        srcSet: `
            https://media.spdigital.cl/file_upload/Mobile_Hero_4_Categoria_AFPS-1_7e8828e2.webp 480w,
            https://media.spdigital.cl/file_upload/Desktop_Hero_4_Categoria_AFPS-1_7dbc37a4.webp
        `,
        sizes: '(max-width: 768px) 100vw, 1920px',
        alt: 'Productos destacados',
        link: 'categoria/5'
    }
];

function Home() {
    const { productos } = useProducts();
    
    return (
        <>
            <Navbar />
            <CategoriasNav />
            <Carousel slides={slides} />
            <ProductSlider title="Productos destacados" products={productos} />
            <ProductSlider title="Ofertas" products={productos} />
            <Footer />
        </>
    )
}

export default Home