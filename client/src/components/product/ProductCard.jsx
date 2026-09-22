import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart, Sparkles, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const images = product.images || [];
  const primaryImg = images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product.id, 1, product.sizes?.[0] || null);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E8D5A3]/60 hover:border-[#D4AF37] shadow-soft hover:shadow-card transition-all duration-500 flex flex-col overflow-hidden">
      {/* Product Image Container with Royal Frame */}
      <Link
        to={`/products/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8F5] block"
      >
        <img
          src={primaryImg}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle Luxury Inner Vignette Overlay */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />

        {/* Hover Quick View Overlay (Never swaps image!) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/70 via-[#1A1410]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A1410]/95 text-[#D4AF37] border border-[#D4AF37]/50 text-[11px] font-serif font-bold tracking-wider shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Explore Details</span>
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          {discountPercent && (
            <span className="px-2.5 py-1 rounded bg-[#8B1E1E] text-white text-[10px] font-bold uppercase tracking-widest shadow-md border border-white/20">
              {discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-0.5 rounded bg-[#1A1410] text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest shadow-md border border-[#D4AF37]/40">
              New Arrival
            </span>
          )}
        </div>

        {/* Fabric Tag */}
        {product.fabric && (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-[#1A1410]/85 backdrop-blur-md text-[#F8F5EE] text-[10px] font-medium border border-white/10 shadow-sm max-w-[180px] truncate block">
              {product.fabric}
            </span>
          </div>
        )}
      </Link>

      {/* Details Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category */}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-1">
            {product.category?.name || 'Handloom Bedding'}
          </span>

          {/* Title - Fixed min-height for perfect grid alignment */}
          <div className="h-11 flex items-start">
            <Link
              to={`/products/${product.slug}`}
              className="font-serif text-sm sm:text-base font-bold text-stone-900 line-clamp-2 hover:text-[#8C6E2C] transition-colors leading-snug"
              title={product.title}
            >
              {product.title}
            </Link>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-3 border-t border-[#F2EDE4] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold text-stone-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-800 font-semibold">
                In Stock & Handcrafted
              </span>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={adding}
            className="p-2.5 bg-[#FAF7F2] hover:bg-[#D4AF37] text-[#8C6E2C] hover:text-[#1A1410] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl transition-all duration-300 cursor-pointer shadow-xs focus:outline-none active:scale-95"
            title="Add to Shopping Bag"
            aria-label="Add to bag"
          >
            {adding ? (
              <Check className="w-4 h-4 text-emerald-700 animate-bounce" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
