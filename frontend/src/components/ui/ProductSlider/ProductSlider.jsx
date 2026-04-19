import { useRef, useState } from 'react';
import { ProductCard } from '../Card/ProductCard'; 
import { getMainProductImageUrl } from '../../../utils/productImages'; // Ajusta la ruta
import { useNavigate } from 'react-router-dom';
import './ProductSlider.css';
export const ProductSlider = ({ title, products }) => {
  const sliderRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);
  const navigate = useNavigate();

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      // Umbral de 10px para evitar problemas de redondeo de píxeles
      setShowLeftBtn(scrollLeft > 10);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      // Avanzar el ancho de 3 tarjetas aprox (ajustable)
      const scrollAmount = sliderRef.current.clientWidth * 0.75; 
      const newScroll = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount 
        : sliderRef.current.scrollLeft + scrollAmount;

      sliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="product-slider-section">
      
      {/* Título separado para que no interfiera con la altura de las flechas */}
      <div className="slider-title-container">
        <h2>{title}</h2>
      </div>

      {/* Contenedor relativo para posicionar las flechas absolutamente */}
      <div className="slider-wrapper">
        
        {/* Botón Izquierdo */}
        <button 
          className={`slider-btn slider-btn-left ${!showLeftBtn ? 'hidden' : ''}`} 
          onClick={() => scroll('left')} 
          aria-label="Ver anteriores"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Track del Slider */}
        <div 
          className="slider-track" 
          ref={sliderRef} 
          onScroll={checkScroll}
        >
          {products.map((producto) => (
            <div key={producto.id} className="slider-card-item">
              <ProductCard 
                className="product-card"
                imageSrc={getMainProductImageUrl(producto)}
                altText={producto.altText || producto.nombre} 
                title={producto.nombre} 
                description={producto.descripcion} 
                price={producto.precioVenta} 
                actionLabel="Ver producto" 
                onAction={() => navigate(`/producto/${producto.id}`)}
              />
            </div>
          ))}
        </div>

        {/* Botón Derecho */}
        <button 
          className={`slider-btn slider-btn-right ${!showRightBtn ? 'hidden' : ''}`} 
          onClick={() => scroll('right')} 
          aria-label="Ver siguientes"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

      </div>
    </section>
  );
};