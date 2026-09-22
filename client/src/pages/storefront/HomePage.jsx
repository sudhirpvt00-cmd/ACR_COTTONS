import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Headphones, Quote } from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import HeroCarousel from '../../components/storefront/HeroCarousel.jsx';
import CategoryTiles from '../../components/storefront/CategoryTiles.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import { productApi } from '../../services/api.js';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [featuredRes, newRes] = await Promise.all([
          productApi.getAll({ isFeatured: 'true', limit: 8 }),
          productApi.getAll({ isNewArrival: 'true', limit: 8 }),
        ]);

        if (featuredRes.success) setFeaturedProducts(featuredRes.products || []);
        if (newRes.success) setNewArrivals(newRes.products || []);
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <StoreLayout>
      <HeroCarousel />

      <section className="border-y border-gold-200/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ['Private atelier', 'Erode flagship shop'],
            ['Direct manufacturer', 'A.C. Raj Kumar'],
            ['Boutique hotel finish', 'Jacquard & velvet'],
            ['Concierge support', 'WhatsApp & in-store'],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="font-serif text-lg text-espresso">{title}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold-700 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <CategoryTiles />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="gold-rule mb-10" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700 block mb-1">
              Curated luxury
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-espresso">
              Featured pillowcases & bedding
            </h2>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="mt-2 sm:mt-0 text-xs font-semibold text-maroon-700 hover:text-maroon-900 inline-flex items-center gap-1 group"
          >
            <span>View all featured</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch auto-rows-fr">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Customized T-Shirt Printing Studio Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#1A1410] via-[#2A1D15] to-[#1A1410] text-[#FAF7F2] p-8 sm:p-12 border border-[#D4AF37]/40 shadow-elevated grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              Specialty Atelier Service
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Customized T-Shirt Printing Studio
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Upload your custom design, brand logo, or event artwork and preview it on a virtual 3D T-shirt in realtime. Choose apparel colors, rotate, scale, and place your order directly with our Erode workshop.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#D4AF37] pt-2">
              <span className="flex items-center gap-1.5">
                ✦ Minimum Order: <strong>10 Shirts</strong>
              </span>
              <span className="flex items-center gap-1.5">
                ✦ 180 & 220 GSM Bio-Washed Combed Cotton
              </span>
              <span className="flex items-center gap-1.5">
                ✦ Real-Time 5-Stage Tracking Provided
              </span>
            </div>
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/custom-studio"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D4AF37] text-[#1A1410] font-serif font-bold text-sm shadow-xl hover:bg-white transition-colors"
              >
                <span>Launch Virtual 3D T-Shirt Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors"
              >
                <span>Track Consignment</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <Link
              to="/custom-studio"
              className="group relative p-4 rounded-3xl bg-[#140E0A] border border-[#D4AF37]/40 shadow-2xl flex flex-col items-center justify-center hover:border-[#D4AF37] transition-all duration-300 w-72 h-80"
              title="Launch Virtual 3D T-Shirt Studio"
            >
              {/* Virtual Mockup SVG */}
              <div className="relative w-52 h-60 flex items-center justify-center">
                <svg viewBox="0 0 500 520" className="w-full h-full drop-shadow-xl">
                  <path
                    d="M 160 50 Q 200 80 250 80 Q 300 80 340 50 L 430 110 L 380 180 L 330 150 L 340 450 Q 250 460 160 450 L 170 150 L 120 180 L 70 110 Z"
                    fill="#1A1410"
                    stroke="#D4AF37"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 200 65 Q 250 105 300 65 Q 250 80 200 65 Z"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.4)"
                    strokeWidth="4"
                  />
                  {/* Chest Custom Print Zone */}
                  <rect x="180" y="160" width="140" height="140" rx="12" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                  <text x="250" y="215" textAnchor="middle" fontSize="16" fontFamily="serif" fontWeight="bold" fill="#D4AF37">ACR COTTONS</text>
                  <text x="250" y="235" textAnchor="middle" fontSize="11" fontFamily="sans-serif" letterSpacing="3" fill="#FAF7F2" opacity="0.9">ERODE · ATELIER</text>
                  <text x="250" y="265" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#C4A35A">YOUR ARTWORK HERE</text>
                </svg>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#1A1410] text-[#D4AF37] border border-[#D4AF37] rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xl group-hover:bg-[#D4AF37] group-hover:text-[#1A1410] transition-colors">
                Launch Virtual 3D Studio →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* MEET OUR FOUNDER: A.C. RAJ KUMAR (With Owner Picture & Philosophy) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-[#E8D5A3] text-espresso p-8 sm:p-14 shadow-card grid lg:grid-cols-12 gap-8 items-center">
          {/* Owner Picture in Royal Gold Frame */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative p-2 rounded-3xl bg-gradient-to-tr from-[#1A1410] via-[#C4A35A] to-[#1A1410] shadow-xl mb-4">
              <img
                src="/images/owner.jpeg"
                alt="A.C. Raj Kumar - Founder, ACR Cottons"
                className="w-56 h-64 sm:w-64 sm:h-72 object-cover object-top rounded-2xl shadow-md"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1A1410] text-[#D4AF37] border border-[#D4AF37] rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-md">
                Founder & Master Artisan
              </div>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
              A.C. RAJ KUMAR
            </h3>
            <p className="text-[11px] uppercase font-semibold tracking-[0.2em] text-[#8C6E2C]">
              Visionary Behind ACR Cottons
            </p>
          </div>

          {/* Founder Bio & Heritage */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] text-[#8C6E2C] text-[11px] font-bold uppercase tracking-[0.2em] border border-[#E8D5A3]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Meet Our Founder
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
              From Thread to Treasure
            </h2>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              The visionary behind ACR Cottons is dedicated to redefining home comfort through artisanal excellence. Based in Erode, Tamil Nadu — the prominent textile hub known as the <strong>"Textile Valley of South India"</strong> — ACR Cottons crafts elegant, soft bedspreads, jacquard pillows, and luxury customized cotton t-shirts.
            </p>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Our core philosophy focuses on bringing the feel of a high-end boutique hotel into everyday residential spaces using rich colors, intricate patterns (like damask and jacquard), and 100% bio-washed combed fabrics.
            </p>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8D5A3] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-stone-900 block">Flagship Atelier:</span>
                <span className="text-stone-600">2, Sathya Moorthy Street, Surampatti Valasu, Erode - 638009</span>
              </div>
              <div className="text-stone-700">
                <span>Timings: <strong>8:00 AM – 8:00 PM (Mon–Fri)</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://maps.app.goo.gl/48x6D8xnWNCibc9YA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1410] text-[#D4AF37] hover:text-white text-sm font-semibold border border-[#D4AF37] shadow-sm transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Visit Store in Erode (Google Maps)</span>
              </a>
              <a
                href="https://wa.me/918778824123?text=Hello%20A.C.%20Raj%20Kumar%20and%20ACR%20Cottons%20Team%2C%20I%20would%20like%20to%20inquire%20about%20your%20textiles."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <Headphones className="w-4 h-4" />
                <span>Chat with Concierge (+91 87788 24123)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700 block mb-1">
              Fresh from the loom
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-espresso">New arrivals</h2>
          </div>
          <Link
            to="/products?isNewArrival=true"
            className="mt-2 sm:mt-0 text-xs font-semibold text-maroon-700 inline-flex items-center gap-1 group"
          >
            <span>View all new arrivals</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch auto-rows-fr">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['A boutique hotel at home', 'The damask bedspread changed the entire mood of our guest room.'],
            ['Soft, royal, and considerate', 'WhatsApp support helped us choose the right sham sizes in minutes.'],
            ['Worth the visit to Erode', 'The Surampatti Valasu shop lets you feel every weave before you buy.'],
          ].map(([title, quote]) => (
            <blockquote key={title} className="rounded-3xl border border-gold-200/80 bg-white/70 p-6 shadow-soft">
              <Quote className="w-5 h-5 text-gold-500 mb-3" />
              <p className="font-serif text-xl text-espresso">{title}</p>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{quote}</p>
            </blockquote>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
}
