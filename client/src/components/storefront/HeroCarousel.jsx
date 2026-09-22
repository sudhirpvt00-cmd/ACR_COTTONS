import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: 'Textiles Woven for Everyday Luxury',
    title: 'ACR Prints Boutique Hotel Bedding',
    subtitle: 'Redefining home comfort through artisanal excellence in Erode. Handcrafted textured pillowcases, velvet lumbar cushions, and royal damask bedspreads.',
    ctaText: 'Explore Collections',
    ctaLink: '/products',
    image: '/images/products/pillow_cover_1.jpeg',
    accent: 'from-amber-950/90 via-orange-950/80 to-stone-900/60',
  },
  {
    id: 2,
    badge: 'Artisanal Craftsmanship',
    title: 'Jacquard Pillows & Velvet Cushions',
    subtitle: 'Elevate your living space with rich colors, dimensional textures, and soft blush pink linen with metallic embroidery.',
    ctaText: 'Shop Accent Cushions',
    ctaLink: '/products?category=accent-cushions',
    image: '/images/products/pillow_cover_5.jpeg',
    accent: 'from-stone-950/90 via-amber-950/80 to-orange-950/60',
  },
  {
    id: 3,
    badge: 'Curated Sets & Bundles',
    title: 'Royal Neutral Bed Set Box',
    subtitle: 'Complete luxury bedding bundles direct from master artisans in Erode, Tamil Nadu. Designed for a peaceful, royal living experience.',
    ctaText: 'View Bedding Sets',
    ctaLink: '/products?category=large-bedding',
    image: '/images/products/pillow_cover_9.jpeg',
    accent: 'from-orange-950/90 via-stone-950/80 to-amber-950/60',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] md:h-[600px] overflow-hidden bg-stone-950">
      {/* Slides */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`} />

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-white">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Heading */}
                  <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4 text-amber-50">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base md:text-lg text-amber-100/90 leading-relaxed mb-8 max-w-xl">
                    {slide.subtitle}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to={slide.ctaLink}
                      className="px-6 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl text-sm shadow-elevated transition-all flex items-center gap-2 group"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      to="/products?category=pillowcases-shams"
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold rounded-xl text-sm backdrop-blur-sm transition-all"
                    >
                      Pillowcases & Shams
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-2.5 bg-amber-400'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
