import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  Package,
  Sparkles,
  X,
  ChevronDown,
  ArrowRight,
  Menu,
  MapPin,
  Headphones,
  Truck,
  Award,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { productApi } from '../../services/api.js';
import UserAvatar from '../common/UserAvatar.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { itemCount, openCart } = useCart();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Dropdown states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const collectionsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) {
        setCollectionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      setCategorySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const data = await productApi.getSuggestions(searchTerm.trim());
        if (data.success) {
          setSuggestions(data.suggestions || []);
          setCategorySuggestions(data.categories || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectSuggestion = (slug) => {
    setShowSuggestions(false);
    setSearchTerm('');
    navigate(`/products/${slug}`);
  };

  const handleSelectCategory = (catSlug) => {
    setShowSuggestions(false);
    setSearchTerm('');
    navigate(`/products?category=${catSlug}`);
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const COLLECTION_ITEMS = [
    {
      title: 'All Bedding Collections',
      desc: 'Complete catalog of artisanal hotel-grade textiles',
      path: '/products',
      tag: 'Catalog',
    },
    {
      title: 'Pillowcases & Shams',
      desc: 'High thread-count cotton, woven floral & hotel borders',
      path: '/products?category=pillowcases-shams',
      tag: 'Bedding',
    },
    {
      title: 'Accent Cushions',
      desc: 'Sumptuous plush velvet lumbar & embroidered designer pieces',
      path: '/products?category=accent-cushions',
      tag: 'Living & Bed',
    },
    {
      title: 'Large Bedding',
      desc: 'Duvet covers, royal damask bedspreads & coordinated sets',
      path: '/products?category=large-bedding',
      tag: 'King & Queen',
    },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-xl border-b border-gold-200/70 shadow-soft">
      {/* Top Royal Announcement Bar */}
      <div className="bg-espresso text-gold-200 text-[11px] py-2 px-4 text-center tracking-[0.18em] font-medium flex items-center justify-center gap-2 uppercase">
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        <span>ACR COTTONS · Private Atelier & Custom Studio · Erode · Call: +91 87788 24123</span>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-espresso flex items-center justify-center text-gold-300 border border-gold-500/40 shadow-md group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-espresso block leading-tight">
                ACR COTTONS
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-[0.24em] text-gold-700 block">
                Royal Textiles & Custom Prints · Erode
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-4 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search textured pillowcases, velvet cushions, duvet covers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0 || categorySuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full pl-11 pr-24 py-2.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-[#D4AF37] rounded-full text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-[#1A1410] to-[#2D2018] text-[#D4AF37] hover:brightness-120 border border-[#D4AF37]/30 rounded-full text-xs font-semibold shadow-sm transition-all"
              >
                Search
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || categorySuggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-stone-200 overflow-hidden z-50 animate-fadeIn">
                {categorySuggestions.length > 0 && (
                  <div className="p-3 bg-amber-50/50 border-b border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-2">
                      Matching Collections
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {categorySuggestions.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.slug)}
                          className="px-3 py-1 bg-white border border-amber-200 hover:border-[#D4AF37] rounded-full text-xs font-medium text-stone-800 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.slug)}
                      className="w-full p-3 text-left hover:bg-stone-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.images?.[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-stone-200"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate group-hover:text-[#8C6E2C]">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-stone-400 uppercase">
                            {item.category?.name || 'Bedding'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-stone-900 ml-2 shrink-0">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Button */}
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: { pathname: '/cart' } } });
                  return;
                }
                openCart();
              }}
              className="relative p-2.5 text-espresso hover:text-[#8C6E2C] hover:bg-gold-50 rounded-xl transition-colors cursor-pointer"
              aria-label="Shopping bag"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#8B1E1E] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile Menu */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-stone-100/80 border border-stone-200/80 transition-all text-stone-800 cursor-pointer"
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold leading-none text-stone-900">{user.name}</span>
                    <span className="text-[10px] text-[#8C6E2C] font-semibold leading-tight">My Account</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E8D5A3] overflow-hidden z-50 animate-fadeIn">
                    <div className="p-4 bg-gradient-to-br from-[#1A1410] to-[#2D2018] text-[#FAF7F2] border-b border-[#D4AF37]/30">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                          Client Member
                        </span>
                      </div>
                      <p className="text-sm font-serif font-bold text-white mt-1 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-stone-300 font-mono mt-0.5">
                        +91 {user.mobile}
                      </p>
                    </div>

                    <div className="py-2 text-xs divide-y divide-stone-100">
                      <div className="py-1">
                        {/* Orders & Dispatches */}
                        <Link
                          to="/profile?tab=orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-800 hover:bg-[#FAF8F5] hover:text-[#8C6E2C] font-bold transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#8C6E2C]" />
                          <span>Orders & Dispatches</span>
                        </Link>

                        {/* Tracking Consignment */}
                        <Link
                          to="/track-order"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-[#FAF8F5] hover:text-[#8C6E2C] font-semibold transition-colors"
                        >
                          <Truck className="w-4 h-4 text-stone-400" />
                          <span>Track Consignment</span>
                        </Link>

                        {/* Profile Settings */}
                        <Link
                          to="/profile?tab=profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <User className="w-4 h-4 text-stone-400" />
                          <span>Account Profile</span>
                        </Link>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold text-left transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/track-order"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-stone-700 hover:text-[#1A1410] rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5 text-[#8C6E2C]" />
                  <span>Track</span>
                </Link>

                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-serif font-bold text-[#1A1410] bg-[#D4AF37] hover:bg-[#E8D5A3] rounded-xl shadow-sm transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-stone-700 hover:text-[#8C6E2C]"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search pillowcases, cushions, bedding..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Top Navigation Links */}
        <div className="hidden md:flex items-center justify-center gap-10 py-3 border-t border-gold-100 text-xs uppercase tracking-[0.2em] font-semibold">
          
          {/* 1. Direct Click Navigation to Collections + Hover Menu */}
          <div
            ref={collectionsRef}
            className="relative"
            onMouseEnter={() => setCollectionsOpen(true)}
            onMouseLeave={() => setCollectionsOpen(false)}
          >
            <div className="inline-flex items-center gap-1 py-1">
              <Link
                to="/products"
                onClick={() => setCollectionsOpen(false)}
                className={`transition-colors cursor-pointer ${
                  location.pathname.startsWith('/products')
                    ? 'text-[#1A1410] font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Collections
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCollectionsOpen(!collectionsOpen);
                }}
                className="p-0.5 text-stone-500 hover:text-stone-900 cursor-pointer"
                aria-label="Toggle collections menu"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8C6E2C] transition-transform duration-200 ${
                    collectionsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {collectionsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8D5A3] p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6E2C]">
                    Artisanal Handlooms
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <div className="divide-y divide-stone-50">
                  {COLLECTION_ITEMS.map((item) => (
                    <Link
                      key={item.title}
                      to={item.path}
                      onClick={() => setCollectionsOpen(false)}
                      className="p-3 rounded-xl hover:bg-[#FAF8F5] flex flex-col group transition-colors block text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-[#8C6E2C] transition-colors normal-case">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#8C6E2C] border border-amber-200">
                          {item.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5 normal-case tracking-normal">
                        {item.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/custom-studio"
            className={`py-1 transition-colors relative ${
              location.pathname === '/custom-studio'
                ? 'text-[#1A1410] font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Customisation</span>
            {location.pathname === '/custom-studio' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
            )}
          </Link>

          <Link
            to="/location"
            className={`py-1 transition-colors relative ${
              location.pathname === '/location'
                ? 'text-[#1A1410] font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Visit Store</span>
            {location.pathname === '/location' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
            )}
          </Link>

          <Link
            to="/contact"
            className={`py-1 transition-colors relative ${
              location.pathname === '/contact'
                ? 'text-[#1A1410] font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Contact</span>
            {location.pathname === '/contact' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
            )}
          </Link>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6E2C] px-3">
              Collections
            </span>
            {COLLECTION_ITEMS.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-800 hover:bg-stone-100 rounded-lg"
              >
                {item.title}
              </Link>
            ))}

            <div className="my-2 border-t border-stone-100" />

            <Link
              to="/custom-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-100 rounded-lg flex items-center justify-between"
            >
              <span>Customisation (T-Shirt Studio)</span>
              <span className="text-[10px] text-[#8C6E2C]">MOQ 10</span>
            </Link>

            <Link
              to="/location"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-100 rounded-lg"
            >
              Visit Store (Erode Flagship)
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-100 rounded-lg"
            >
              Contact & Concierge
            </Link>

            <div className="my-2 border-t border-stone-100" />

            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6E2C] px-3">
              Orders & Account
            </span>
            <Link
              to="/profile?tab=orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs text-stone-800 hover:bg-stone-100 rounded-lg flex items-center gap-2"
            >
              <Package className="w-3.5 h-3.5 text-[#8C6E2C]" />
              <span>Orders & Dispatches</span>
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs text-stone-800 hover:bg-stone-100 rounded-lg flex items-center gap-2"
            >
              <Truck className="w-3.5 h-3.5 text-[#8C6E2C]" />
              <span>Track Consignment</span>
            </Link>
            <Link
              to="/profile?tab=profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs text-stone-800 hover:bg-stone-100 rounded-lg flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>Account Profile</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}