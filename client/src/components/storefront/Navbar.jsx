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
  Truck,
  Crown,
  Home,
  Layers,
  Wand2,
  ChevronRight,
  MapPin,
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

  // Dropdown & Menu states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const collectionsRef = useRef(null);

  // Close menus on outside click
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

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      setCategorySuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await productApi.getSuggestions(searchTerm.trim());
        if (data.success) {
          setSuggestions(data.suggestions || []);
          setCategorySuggestions(data.categories || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const COLLECTION_ITEMS = [
    { title: 'All Bedding Collections', path: '/products', tag: 'Catalog' },
    { title: 'Pillowcases & Shams', path: '/products?category=pillowcases-shams', tag: 'Bedding' },
    { title: 'Accent Cushions', path: '/products?category=accent-cushions', tag: 'Living' },
    { title: 'Large Bedding', path: '/products?category=large-bedding', tag: 'Sets' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8]">
        {/* Top Announcement Bar */}
        <div className="bg-[#1A1410] text-[#E5C158] text-[10px] sm:text-xs py-1.5 px-3 text-center tracking-widest uppercase font-sans truncate">
          <Sparkles className="w-3 h-3 inline mr-1 text-[#D4AF37]" />
          <span>ACR COTTONS · Atelier & Custom Studio · Erode</span>
        </div>

        {/* Main Navbar Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Left: Mobile Hamburger & Brand */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 md:hidden text-stone-800 hover:text-[#8C6E2C] rounded-xl hover:bg-stone-100 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#1A1410] flex items-center justify-center border border-[#D4AF37]/50 shadow-sm">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5C158]" />
                </div>
                <div>
                  <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#1A1410] block leading-tight">
                    ACR COTTONS
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-[0.2em] text-[#8C6E2C] hidden sm:block">
                    Royal Handlooms · Erode
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-lg mx-4 hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search pillowcases, cushions, bedspreads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-24 py-2 bg-white border border-[#DDD0BC] focus:border-[#D4AF37] rounded-full text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-[#1A1410] text-[#D4AF37] rounded-full text-xs font-semibold cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Mobile Search Toggle Icon */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 md:hidden text-stone-700 hover:text-[#8C6E2C] rounded-xl cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: { pathname: '/cart' } } });
                    return;
                  }
                  openCart();
                }}
                className="relative p-2 text-stone-800 hover:text-[#8C6E2C] rounded-xl hover:bg-stone-100 cursor-pointer"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#8B1E1E] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Desktop Profile Button */}
              {user ? (
                <div ref={profileRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:border-[#D4AF37] transition-all cursor-pointer"
                  >
                    <UserAvatar user={user} size="sm" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-none text-stone-900">{user.name}</span>
                      <span className="text-[10px] text-[#8C6E2C] font-semibold">My Account</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8D5A3] overflow-hidden z-50">
                      <div className="p-3 bg-[#1A1410] text-white border-b border-[#D4AF37]/30">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#E5C158] block">
                          Client Member
                        </span>
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono">+91 {user.mobile}</p>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to="/profile?tab=orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-stone-800 hover:bg-[#FAF8F5] font-semibold"
                        >
                          <Package className="w-4 h-4 text-[#8C6E2C]" />
                          <span>Orders & Dispatches</span>
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-stone-700 hover:bg-[#FAF8F5]"
                        >
                          <Truck className="w-4 h-4 text-stone-400" />
                          <span>Track Consignment</span>
                        </Link>
                        <Link
                          to="/profile?tab=profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-stone-700 hover:bg-[#FAF8F5]"
                        >
                          <User className="w-4 h-4 text-stone-400" />
                          <span>Account Settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-left border-t border-stone-100 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1 px-4 py-2 text-xs font-serif font-bold text-[#1A1410] bg-[#D4AF37] hover:bg-[#E8D5A3] rounded-xl shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>

          {/* Expandable Mobile Search */}
          {mobileSearchOpen && (
            <div className="pb-3 pt-1 md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-16 py-2 bg-white border border-[#DDD0BC] rounded-xl text-xs"
                  autoFocus
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1A1410] text-[#D4AF37] rounded-lg text-[11px]"
                >
                  Go
                </button>
              </form>
            </div>
          )}

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center justify-center gap-10 py-2.5 border-t border-[#E8DFC8] text-xs uppercase tracking-[0.2em] font-semibold text-stone-700">
            <Link
              to="/products"
              className={`hover:text-stone-900 ${location.pathname.startsWith('/products') ? 'text-[#1A1410] font-bold' : ''}`}
            >
              Collections
            </Link>
            <Link
              to="/custom-studio"
              className={`hover:text-stone-900 ${location.pathname === '/custom-studio' ? 'text-[#1A1410] font-bold' : ''}`}
            >
              Customisation
            </Link>
            <Link
              to="/location"
              className={`hover:text-stone-900 ${location.pathname === '/location' ? 'text-[#1A1410] font-bold' : ''}`}
            >
              Visit Store
            </Link>
            <Link
              to="/contact"
              className={`hover:text-stone-900 ${location.pathname === '/contact' ? 'text-[#1A1410] font-bold' : ''}`}
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER (Matches Exact List Layout) */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-5 border-r border-[#E8DFC8]">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1410] flex items-center justify-center">
                    <Crown className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <span className="font-serif font-bold text-stone-900 text-base">ACR COTTONS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Profile Card */}
              {user ? (
                <Link
                  to="/profile?tab=orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white border border-[#E8D5A3] flex items-center justify-between shadow-xs block"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="sm" />
                    <div>
                      <span className="block text-xs font-bold text-stone-900">{user.name}</span>
                      <span className="text-[10px] text-[#8C6E2C] font-semibold">View Orders & Profile</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              ) : (
                <div className="p-3 rounded-2xl bg-[#1A1410] text-center">
                  <p className="text-xs text-stone-300 mb-2">Welcome to ACR Cottons</p>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-block w-full py-2 bg-[#D4AF37] text-stone-950 rounded-xl font-serif font-bold text-xs"
                  >
                    Sign In to Account
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6E2C] px-3 block mb-1">
                  Explore Handlooms
                </span>
                {COLLECTION_ITEMS.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-white"
                  >
                    <span>{item.title}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-50 text-[#8C6E2C] border border-amber-200">
                      {item.tag}
                    </span>
                  </Link>
                ))}

                <div className="pt-2 border-t border-[#E8DFC8]/60 mt-2" />

                <Link
                  to="/custom-studio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-900 hover:bg-white"
                >
                  <span>Customisation Studio</span>
                  <span className="text-[10px] text-[#8C6E2C]">MOQ 10</span>
                </Link>

                {/* Direct Link to Location / Store Details Page */}
                <Link
                  to="/location"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-900 hover:bg-white"
                >
                  <span>Visit Erode Flagship Store</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-900 hover:bg-white"
                >
                  <span>Contact & Concierge</span>
                </Link>
              </div>
            </div>

            {/* Logout button at bottom of drawer */}
            {user && (
              <div className="pt-4 border-t border-[#E8DFC8]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM APP BAR (Home · Collections · Custom · Profile) */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 py-1.5 px-4 flex items-center justify-around shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            location.pathname === '/' ? 'text-[#8C6E2C] font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            location.pathname.startsWith('/products') ? 'text-[#8C6E2C] font-bold' : 'text-stone-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Collections</span>
        </Link>

        <Link
          to="/custom-studio"
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            location.pathname === '/custom-studio' ? 'text-[#8C6E2C] font-bold' : 'text-stone-500'
          }`}
        >
          <Wand2 className="w-5 h-5 text-[#8C6E2C]" />
          <span>Custom</span>
        </Link>

        <Link
          to={user ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            location.pathname === '/profile' ? 'text-[#8C6E2C] font-bold' : 'text-stone-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
}