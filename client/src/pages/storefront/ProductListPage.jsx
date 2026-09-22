import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import FilterSidebar from '../../components/product/FilterSidebar.jsx';
import { productApi, categoryApi } from '../../services/api.js';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [facets, setFacets] = useState({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract params
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentFabric = searchParams.get('fabric') || '';
  const currentColor = searchParams.get('color') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const isFeatured = searchParams.get('isFeatured') || '';
  const isNewArrival = searchParams.get('isNewArrival') || '';

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const data = await categoryApi.getAll();
        if (data.success) setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCats();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = {
          category: currentCategory,
          search: currentSearch,
          fabric: currentFabric,
          color: currentColor,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
          sort: currentSort,
          page: currentPage,
          isFeatured,
          isNewArrival,
        };

        const data = await productApi.getAll(params);
        if (data.success) {
          setProducts(data.products || []);
          setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
          if (data.facets) setFacets(data.facets);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [
    currentCategory,
    currentSearch,
    currentFabric,
    currentColor,
    currentMinPrice,
    currentMaxPrice,
    currentSort,
    currentPage,
    isFeatured,
    isNewArrival,
  ]);

  // Update query params helper
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // reset to page 1 on filter changes
    setSearchParams(next);
  };

  const handlePriceChange = (min, max) => {
    const next = new URLSearchParams(searchParams);
    if (min !== undefined && min !== '') next.set('minPrice', min);
    else next.delete('minPrice');

    if (max !== undefined && max !== '') next.set('maxPrice', max);
    else next.delete('maxPrice');

    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Title & Breadcrumb */}
        <div className="mb-6">
          <span className="text-xs uppercase font-bold tracking-widest text-orange-800">
            ACR Prints Catalog
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            {currentSearch
              ? `Search results for "${currentSearch}"`
              : activeCategoryObj
              ? activeCategoryObj.name
              : isFeatured
              ? 'Featured Festive Collection'
              : isNewArrival
              ? 'Fresh Arrivals Off The Loom'
              : 'All Handwoven Collections'}
          </h1>
          {activeCategoryObj?.description && !currentSearch && (
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              {activeCategoryObj.description}
            </p>
          )}
        </div>

        {/* Toolbar: Result count, Active filters, Sort dropdown & Mobile filter trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
            <span>
              Showing <strong className="text-stone-900">{products.length}</strong> of{' '}
              <strong className="text-stone-900">{pagination.total}</strong> luxury textiles
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-700" />
              <span>Filters</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 hidden sm:inline">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-orange-500 shadow-xs"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(currentCategory || currentFabric || currentColor || currentMinPrice || currentMaxPrice || currentSearch) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Active:</span>

            {currentSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 border border-amber-200 rounded-full text-xs text-amber-950 font-medium">
                <span>Keyword: "{currentSearch}"</span>
                <button onClick={() => updateParam('search', '')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100/70 border border-orange-200 rounded-full text-xs text-orange-950 font-medium">
                <span>Category: {activeCategoryObj?.name || currentCategory}</span>
                <button onClick={() => updateParam('category', '')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {currentFabric && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs text-stone-800 font-medium">
                <span>Fabric: {currentFabric}</span>
                <button onClick={() => updateParam('fabric', '')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {currentColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs text-stone-800 font-medium">
                <span>Color: {currentColor}</span>
                <button onClick={() => updateParam('color', '')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs text-stone-800 font-medium">
                <span>Price: ₹{currentMinPrice || '0'} - ₹{currentMaxPrice || 'Max'}</span>
                <button onClick={() => handlePriceChange('', '')}><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-orange-700 hover:text-orange-900 underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content Layout: Sidebar + Product Grid */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            facets={facets}
            selectedCategory={currentCategory}
            selectedFabric={currentFabric}
            selectedColor={currentColor}
            minPrice={currentMinPrice}
            maxPrice={currentMaxPrice}
            onCategoryChange={(val) => updateParam('category', val)}
            onFabricChange={(val) => updateParam('fabric', val)}
            onColorChange={(val) => updateParam('color', val)}
            onPriceChange={handlePriceChange}
            onResetFilters={handleResetFilters}
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
          />

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-200 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-soft">
                <Sparkles className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
                  No matching bedding or cushions found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                  Try clearing your filters or search for another item like "Pillowcase", "Velvet", "Damask", or "Jacquard".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-orange-700 text-white rounded-xl text-xs font-bold hover:bg-orange-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch auto-rows-fr">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-stone-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                            : 'border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages}
                      className="p-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
