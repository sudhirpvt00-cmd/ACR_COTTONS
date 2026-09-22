import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

export default function FilterSidebar({
  categories = [],
  facets = {},
  selectedCategory,
  selectedFabric,
  selectedColor,
  minPrice,
  maxPrice,
  onCategoryChange,
  onFabricChange,
  onColorChange,
  onPriceChange,
  onResetFilters,
  isOpen,
  onClose,
}) {
  const fabrics = facets.fabrics || [];
  const colors = facets.colors || [];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-700" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Filters
          </h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
          Categories
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-orange-800">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory || selectedCategory === 'all'}
              onChange={() => onCategoryChange('all')}
              className="accent-orange-600 w-3.5 h-3.5"
            />
            <span>All Weaves</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center justify-between text-xs text-stone-700 cursor-pointer hover:text-orange-800"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.slug}
                  onChange={() => onCategoryChange(cat.slug)}
                  className="accent-orange-600 w-3.5 h-3.5"
                />
                <span>{cat.name}</span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">
                ({cat.productCount})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fabric Types */}
      {fabrics.length > 0 && (
        <div className="pt-4 border-t border-stone-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
            Fabric & Material
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-orange-800">
              <input
                type="radio"
                name="fabric"
                checked={!selectedFabric || selectedFabric === 'all'}
                onChange={() => onFabricChange('all')}
                className="accent-orange-600 w-3.5 h-3.5"
              />
              <span>All Fabrics</span>
            </label>
            {fabrics.map((fab) => (
              <label
                key={fab}
                className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-orange-800"
              >
                <input
                  type="radio"
                  name="fabric"
                  checked={selectedFabric === fab}
                  onChange={() => onFabricChange(fab)}
                  className="accent-orange-600 w-3.5 h-3.5"
                />
                <span className="truncate">{fab}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="pt-4 border-t border-stone-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
            Color Palette
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onColorChange('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                !selectedColor || selectedColor === 'all'
                  ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold'
                  : 'border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              All Colors
            </button>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedColor === c
                    ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold'
                    : 'border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="pt-4 border-t border-stone-200/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <label className="text-[10px] text-stone-500 block mb-1">Min</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice || ''}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-500 block mb-1">Max</label>
            <input
              type="number"
              placeholder="25000"
              value={maxPrice || ''}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Quick price presets */}
        <div className="space-y-1.5 text-[11px]">
          {[
            { label: 'Under ₹2,000', min: 0, max: 2000 },
            { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
            { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
            { label: 'Above ₹10,000 (Pure Silk)', min: 10000, max: '' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onPriceChange(preset.min, preset.max)}
              className="block w-full text-left py-1 text-stone-600 hover:text-orange-800 transition-colors"
            >
              • {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-soft self-start sticky top-28">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-end mb-2">
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>
            <div className="pt-6 border-t mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
