import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { categoryApi } from '../../services/api.js';

export default function CategoryTiles() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await categoryApi.getAll();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-800 block mb-1">
            Handpicked Weaves
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Shop By Handloom Category
          </h2>
        </div>
        <Link
          to="/products"
          className="mt-2 sm:mt-0 text-xs font-bold text-orange-700 hover:text-orange-900 inline-flex items-center gap-1 group"
        >
          <span>View all collections</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="group relative h-80 rounded-2xl overflow-hidden shadow-card border border-stone-200/60 block"
          >
            {/* Image */}
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/30 to-transparent transition-opacity duration-300 group-hover:from-orange-950/90" />

            {/* Card Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-2">
                {cat.productCount} Designs
              </span>

              <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">
                {cat.name}
              </h3>

              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed opacity-90">
                {cat.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
                <span>Explore Designs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
