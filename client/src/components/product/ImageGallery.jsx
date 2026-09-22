import React, { useState } from 'react';

export default function ImageGallery({ images = [], title = 'Product Image' }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeImage =
    images[selectedIdx] ||
    images[0] ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900';

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 cursor-pointer ${
                idx === selectedIdx
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-md scale-102'
                  : 'border-[#E8D5A3]/50 hover:border-[#D4AF37]/80 opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container (Clean & Stable Luxury View) */}
      <div className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden border border-[#E8D5A3]/70 bg-[#FAF8F5] shadow-card">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle Luxury Inner Vignette Ring */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
      </div>
    </div>
  );
}
