import { useState, useEffect } from 'react';
import './Carousel.css';
import { Link } from 'react-router-dom'; 

const Carousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentIndex(index);
  const nextSlide = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  if (!slides || slides.length === 0) return null;

  return (
    <div className="carousel-container">
      <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className="carousel-slide">
            <Link to={slide.link} className="slide-link" aria-label={slide.alt}>
              <img 
                src={slide.src}
                srcSet={slide.srcSet}
                sizes={slide.sizes}
                alt={slide.alt} 
                loading={index === 0 ? "eager" : "lazy"} 
              />
              <div className="slide-overlay"></div>
            </Link>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={prevSlide} aria-label="Anterior">&#10094;</button>
          <button className="carousel-btn next" onClick={nextSlide} aria-label="Siguiente">&#10095;</button>
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a la diapositiva ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;