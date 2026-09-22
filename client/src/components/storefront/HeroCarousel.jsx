import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Award, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'Erode Handloom Atelier',
    badge: 'Textiles Woven for Everyday Luxury',
    title: 'ACR Prints Boutique Hotel Bedding',
    subtitle:
      'Redefining home comfort through artisanal excellence in Erode. Handcrafted textured pillowcases, velvet lumbar cushions, and royal damask bedspreads.',
    ctaPrimaryText: 'Explore Collections',
    ctaPrimaryLink: '/products',
    ctaSecondaryText: 'Custom Prints',
    ctaSecondaryLink: '/custom-studio',
    image: '/images/products/pillow_cover_1.jpeg',
    pillText: '600 Thread Count',
  },
  {
    id: 2,
    tag: 'Artisan Workshop Collection',
    badge: 'Artisanal Craftsmanship',
    title: 'Jacquard Pillows & Velvet Cushions',
    subtitle:
      'Elevate your living space with rich colors, dimensional textures, and soft blush pink linen with metallic embroidery.',
    ctaPrimaryText: 'Shop Accent Cushions',
    ctaPrimaryLink: '/products?category=accent-cushions',
    ctaSecondaryText: 'Pillowcases & Shams',
    ctaSecondaryLink: '/products?category=pillowcases-shams',
    image: '/images/products/pillow_cover_5.jpeg',
    pillText: '100% Bio-Washed',
  },
  {
    id: 3,
    tag: 'Curated Atelier Bundles',
    badge: 'Curated Sets & Bundles',
    title: 'Royal Neutral Bed Set Box',
    subtitle:
      'Complete luxury bedding bundles direct from master artisans in Erode, Tamil Nadu. Designed for a peaceful, royal living experience.',
    ctaPrimaryText: 'View Bedding Sets',
    ctaPrimaryLink: '/products?category=large-bedding',
    ctaSecondaryText: 'Order Swatches',
    ctaSecondaryLink: '/products',
    image: '/images/products/pillow_cover_9.jpeg',
    pillText: 'Heirloom Weave',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const activeSlide = SLIDES[current];

  return (
    <section className="relative w-full bg-[#FAF7F2] text-[#2C2117] overflow-hidden border-b border-[#E8DFC8]">
      {/* Subtle warm champagne & linen ambient glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#EBDDBF]/40 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#F3EAD8]/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[440px] sm:min-h-[500px]">
          
          {/* ========================================================================= */}
          {/* LEFT SIDE: Subtle Luxury Editorial Copy & Action Buttons */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Tag / Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EAD8] border border-[#D9C496] text-[#7A5B20] text-[11px] font-bold uppercase tracking-[0.22em] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B88E39]" />
                {activeSlide.badge}
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8C7A68] font-sans hidden sm:inline-block">
                • {activeSlide.tag}
              </span>
            </div>

            {/* Slide Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#221811] leading-[1.15] tracking-tight">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-[#5E4E3E] text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal font-serif">
              {activeSlide.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={activeSlide.ctaPrimaryLink}
                className="px-6 py-3.5 bg-[#2B1F17] hover:bg-[#1A130E] text-[#F9F5EC] font-serif font-bold rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-md flex items-center gap-2 transition-all group"
              >
                <span>{activeSlide.ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to={activeSlide.ctaSecondaryLink}
                className="px-6 py-3.5 bg-white/80 hover:bg-white text-[#4A3B2C] hover:text-[#221811] border border-[#D9CDB8] font-serif font-medium rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-xs"
              >
                {activeSlide.ctaSecondaryText}
              </Link>
            </div>

            {/* Slide Controls & Dots */}
            <div className="flex items-center gap-6 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-xl bg-white border border-[#DDD0BC] hover:border-[#B88E39] text-[#5A4837] hover:text-[#B88E39] flex items-center justify-center transition-all shadow-xs"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-xl bg-white border border-[#DDD0BC] hover:border-[#B88E39] text-[#5A4837] hover:text-[#B88E39] flex items-center justify-center transition-all shadow-xs"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      i === current
                        ? 'w-8 bg-[#8C6D2B]'
                        : 'w-2 bg-[#D9CEBA] hover:bg-[#B5A58D]'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <span className="text-xs font-mono text-[#82715F]">
                0{current + 1} / 0{SLIDES.length}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDE: Warm Framed Textile Photography */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/3] sm:aspect-square">
              {/* Outer Subtle Halo */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#D9C496]/50 via-transparent to-[#EBDDBF]/60 -rotate-1 scale-[1.02] -z-10 blur-xs" />

              {/* Frame Card */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#D9C9AB] shadow-xl bg-stone-100">
                <img
                  key={activeSlide.id}
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover object-center transition-opacity duration-700 ease-out"
                />

                {/* Light bottom fade to ground the badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Quality Pill */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs backdrop-blur-md bg-white/90 px-4 py-2.5 rounded-2xl border border-[#DFD3BE] text-[#3A2B1D] shadow-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#8C6D2B]" />
                    <span className="font-serif font-bold tracking-wide">
                      {activeSlide.pillText}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-[#7A5B20] font-semibold">
                    Authentic Atelier
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}