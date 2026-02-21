import React, { useEffect, useRef, useState } from 'react';

const bannerImages = [
  {
    id: 1,
    src: '/sample-photo/banner (1).jpg',
    alt: 'Promo Spesial The Jago Store',
    title: 'Promo Spesial',
    subtitle: 'Diskon hingga 50% untuk produk frozen food pilihan',
    cta: 'Belanja Sekarang'
  },
  {
    id: 2,
    src: '/sample-photo/banner (2).jpg',
    alt: 'Snack Box Hemat',
    title: 'Snack Box Hemat',
    subtitle: 'Paket snack lengkap untuk keluarga dengan harga terjangkau',
    cta: 'Lihat Paket'
  },
  {
    id: 3,
    src: '/sample-photo/banner (3).jpg',
    alt: 'Frozen Food Premium',
    title: 'Frozen Food Premium',
    subtitle: 'Kualitas terbaik dengan bahan pilihan dan proses higienis',
    cta: 'Eksplor Produk'
  }
];

export default function Features() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const resumeTimerRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    []
  );

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds of user interaction
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    goToSlide((currentSlide - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToNext = () => {
    goToSlide((currentSlide + 1) % bannerImages.length);
  };

  return (
    <section className="features reveal" style={{ '--delay': '25ms' }}>
      <div className="features__slider">
        <div className="slider__container">
          {bannerImages.map((banner, index) => (
            <div
              key={banner.id}
              className={`slider__slide ${index === currentSlide ? 'slider__slide--active' : ''}`}
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <div className="slider__content">
                <div className="slider__image-container">
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="slider__image"
                    loading="lazy"
                  />
                  <div className="slider__overlay">
                    <div className="slider__text">
                      <h2 className="slider__title">{banner.title}</h2>
                      <p className="slider__subtitle">{banner.subtitle}</p>
                      <button className="slider__cta btn btn--primary">
                        {banner.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <button
          className="slider__nav slider__nav--prev"
          onClick={goToPrevious}
          aria-label="Slide sebelumnya"
        >
          <span className="slider__nav-icon">‹</span>
        </button>
        <button
          className="slider__nav slider__nav--next"
          onClick={goToNext}
          aria-label="Slide berikutnya"
        >
          <span className="slider__nav-icon">›</span>
        </button>

        {/* Slide Indicators */}
        <div className="slider__indicators">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              className={`slider__indicator ${index === currentSlide ? 'slider__indicator--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play status indicator */}
        <div className="slider__autoplay-status">
          <span className={`slider__autoplay-dot ${isAutoPlaying ? 'slider__autoplay-dot--active' : ''}`} />
        </div>
      </div>
    </section>
  );
}
