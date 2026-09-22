import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  Award,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Heart,
  HelpCircle,
} from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import ImageGallery from '../../components/product/ImageGallery.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import { productApi } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

// Comprehensive Indian Pincode Resolver & Delivery Estimator (Amazon/Flipkart style)
function resolvePincodeDelivery(pincode) {
  const pin = String(pincode).trim();
  if (!/^\d{6}$/.test(pin)) {
    return { valid: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
  }

  // Calculate estimated delivery dates
  const now = new Date();
  const getDeliveryDate = (daysToAdd) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  const prefix3 = pin.slice(0, 3);
  const prefix2 = pin.slice(0, 2);

  // Erode local atelier zone (Immediate next-day dispatch)
  if (prefix3 === '638') {
    return {
      valid: true,
      pin,
      city: 'Erode & Surampatti Valasu',
      state: 'Tamil Nadu (Local Flagship Hub)',
      deliveryDate: getDeliveryDate(1),
      speedText: 'Next-Day Express Atelier Dispatch',
      isLocal: true,
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Western & Southern Tamil Nadu (Coimbatore, Salem, Tirupur, Madurai)
  if (['641', '642', '643', '636', '637', '625', '624'].includes(prefix3)) {
    return {
      valid: true,
      pin,
      city: 'Western / Central Tamil Nadu',
      state: 'Tamil Nadu',
      deliveryDate: getDeliveryDate(2),
      speedText: 'Express 48-Hour Road Logistics',
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Chennai & Northern Tamil Nadu
  if (prefix2 === '60' || prefix2 === '61' || prefix2 === '62' || prefix2 === '63') {
    return {
      valid: true,
      pin,
      city: 'Chennai & Tamil Nadu State',
      state: 'Tamil Nadu',
      deliveryDate: getDeliveryDate(2),
      speedText: 'Fast 2-Day Priority Cargo',
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Bengaluru & Karnataka
  if (prefix2 === '56' || prefix2 === '57' || prefix2 === '58' || prefix2 === '59') {
    return {
      valid: true,
      pin,
      city: 'Bengaluru & Karnataka Zone',
      state: 'Karnataka',
      deliveryDate: getDeliveryDate(3),
      speedText: 'Interstate Priority Air/Surface Cargo',
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Hyderabad & Andhra / Telangana
  if (prefix2 === '50' || prefix2 === '51' || prefix2 === '52' || prefix2 === '53') {
    return {
      valid: true,
      pin,
      city: 'Hyderabad & South Zone',
      state: 'Telangana / Andhra Pradesh',
      deliveryDate: getDeliveryDate(3),
      speedText: 'Standard Express Transit',
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Mumbai, Pune & Western India
  if (prefix2 === '40' || prefix2 === '41' || prefix2 === '42' || prefix2 === '43') {
    return {
      valid: true,
      pin,
      city: 'Mumbai / Pune Metro',
      state: 'Maharashtra',
      deliveryDate: getDeliveryDate(3),
      speedText: 'National Express Air Transit',
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Delhi NCR & Northern India
  if (prefix2 === '11' || prefix2 === '12' || prefix2 === '20') {
    return {
      valid: true,
      pin,
      city: 'Delhi NCR Metro',
      state: 'Delhi / NCR',
      deliveryDate: getDeliveryDate(4),
      speedText: 'National Express Air Cargo',
      freeDelivery: true,
      codAvailable: true,
    };
  }

  // Default Pan-India coverage
  return {
    valid: true,
    pin,
    city: 'All-India Serviceable Zone',
    state: 'Pan-India Delivery',
    deliveryDate: getDeliveryDate(4),
    speedText: 'Standard Secured Insured Cargo',
    freeDelivery: true,
    codAvailable: true,
  };
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess, showError, showInfo } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Amazon / Flipkart style Pincode Delivery Availability state
  const [pincodeInput, setPincodeInput] = useState(() => {
    return localStorage.getItem('acr_delivery_pincode') || '638009';
  });
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [pincodeError, setPincodeError] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const data = await productApi.getBySlug(slug);
        if (data.success && data.product) {
          setProduct(data.product);
          setRelated(data.related || []);

          // Standardize sizes to ensure King Size and Queen Size are prominent
          const pSizes = data.product.sizes || [];
          if (pSizes.length > 0) {
            setSelectedSize(pSizes[0]);
          } else {
            setSelectedSize('Queen Size (90 × 90 in)');
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Initial check on mount
  useEffect(() => {
    const saved = localStorage.getItem('acr_delivery_pincode') || '638009';
    const res = resolvePincodeDelivery(saved);
    if (res.valid) {
      setDeliveryInfo(res);
    }
  }, []);

  // Check pincode handler
  const handleCheckPincode = (e) => {
    if (e) e.preventDefault();
    setPincodeError('');
    setIsCheckingPincode(true);

    setTimeout(() => {
      const res = resolvePincodeDelivery(pincodeInput);
      setIsCheckingPincode(false);
      if (!res.valid) {
        setPincodeError(res.error);
        setDeliveryInfo(null);
      } else {
        setDeliveryInfo(res);
        localStorage.setItem('acr_delivery_pincode', res.pin);
        showSuccess(`Delivery confirmed for ${res.pin} (${res.city})!`);
      }
    }, 250);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product.id, quantity, selectedSize);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      setBuyingNow(true);
      const ok = await addToCart(product.id, quantity, selectedSize);
      if (ok) {
        navigate('/checkout');
      }
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
            <div className="lg:col-span-7 aspect-[3/4] bg-stone-200 rounded-3xl" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-6 w-32 bg-stone-200 rounded" />
              <div className="h-10 w-3/4 bg-stone-200 rounded" />
              <div className="h-8 w-40 bg-stone-200 rounded" />
              <div className="h-24 bg-stone-200 rounded" />
              <div className="h-36 bg-stone-200 rounded" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#1A1410] mb-2">
            Product Not Found
          </h2>
          <p className="text-xs text-stone-600 mb-6">
            The requested bedding design might be sold out or retired from the atelier.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-[#1A1410] text-[#D4AF37] border border-[#D4AF37]/50 rounded-xl text-xs font-serif font-bold tracking-wider shadow-md hover:bg-[#2A1D15]"
          >
            Explore Master Collections
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  // Curated size options with King and Queen size prominently supported
  const rawSizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];
  
  // Format sizes for luxury presentation
  const formattedSizes = rawSizes.map((s) => {
    const lower = s.toLowerCase();
    if (lower.includes('king')) {
      return { id: s, label: 'King Size', dimensions: s, badge: 'Master Bed (104 × 90 in)' };
    }
    if (lower.includes('queen')) {
      return { id: s, label: 'Queen Size', dimensions: s, badge: 'Standard Double (90 × 90 in)' };
    }
    if (lower.includes('single') || lower.includes('twin')) {
      return { id: s, label: 'Single / Standard', dimensions: s, badge: 'Single Bed' };
    }
    if (lower.includes('lumbar')) {
      return { id: s, label: 'Lumbar Accent', dimensions: s, badge: 'Ergonomic Fit' };
    }
    return { id: s, label: s, dimensions: s, badge: 'Tailored Weave' };
  });

  // If no sizes were configured, provide standard King and Queen size defaults
  const availableSizes =
    formattedSizes.length > 0
      ? formattedSizes
      : [
          { id: 'King Size (104 × 90 in)', label: 'King Size', dimensions: '104 × 90 in', badge: 'Master Bed' },
          { id: 'Queen Size (90 × 90 in)', label: 'Queen Size', dimensions: '90 × 90 in', badge: 'Standard Double Bed' },
          { id: 'Standard Sham (18 × 28 in)', label: 'Standard Sham', dimensions: '18 × 28 in', badge: 'Pair of 2' },
        ];

  return (
    <StoreLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-stone-900 transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category && (
            <>
              <Link
                to={`/products?category=${product.category.slug}`}
                className="hover:text-stone-900 transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-[#1A1410] font-semibold truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* 2-Column Luxury Layout: Photos Left | Selection & Delivery Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================================================================= */}
          {/* LEFT SIDE: PRODUCT PHOTOS GALLERY */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="relative">
              <ImageGallery images={product.images} title={product.title} />

              {/* Silk Mark & Authenticity Guarantee floating card */}
              <div className="mt-6 p-4 rounded-2xl bg-white border border-[#E8D5A3]/80 shadow-soft grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FAF8F5]">
                  <ShieldCheck className="w-5 h-5 text-[#8C6E2C] mb-1" />
                  <span className="text-[11px] font-bold text-stone-900">Silk Mark Certified</span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wider">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FAF8F5]">
                  <Award className="w-5 h-5 text-[#8C6E2C] mb-1" />
                  <span className="text-[11px] font-bold text-stone-900">Erode Master Loom</span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wider">A.C. Raj Kumar Atelier</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-[#FAF8F5]">
                  <RotateCcw className="w-5 h-5 text-[#8C6E2C] mb-1" />
                  <span className="text-[11px] font-bold text-stone-900">7 Days Hassle-Free</span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wider">Easy Replacement</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT SIDE: SIZE SELECTION, PINCODE DELIVERY CHECKER & ACTIONS */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-[#8C6E2C] border border-[#E8D5A3] text-[10px] font-bold uppercase tracking-[0.2em]">
                  {product.category?.name || 'Handloom Bedding'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In Stock & Ready to Dispatch</span>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1410] leading-tight mb-2">
                {product.title}
              </h1>

              <p className="text-xs text-stone-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8D5A3]/80 shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-extrabold text-[#1A1410]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{product.comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2.5 py-1 rounded bg-[#8B1E1E] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
                <span>Inclusive of all taxes</span>
                <span>•</span>
                <strong className="text-emerald-800">FREE White-Glove Pan-India Shipping</strong>
              </p>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 1. SIZE SELECTION (KING SIZE OR QUEEN SIZE) */}
            {/* ------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8D5A3]/80 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A1410]">
                    Select Size
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    ({selectedSize || 'Select Bed Size'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeModal(true)}
                  className="text-[11px] font-semibold text-[#8C6E2C] hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              {/* Prominent King Size / Queen Size cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableSizes.map((s) => {
                  const isSelected = selectedSize === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSize(s.id)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#FAF8F5] ring-2 ring-[#D4AF37]/40 shadow-sm'
                          : 'border-stone-200 hover:border-[#D4AF37]/60 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#1A1410]' : 'text-stone-800'}`}>
                          {s.label}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#1A1410] flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 font-mono">
                        {s.dimensions}
                      </span>
                      <span className="text-[9px] uppercase font-semibold tracking-wider text-[#8C6E2C] mt-2">
                        {s.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 2. DOWN FROM SIZE: PINCODE DELIVERY AVAILABILITY CHECKER */}
            {/* (Amazon / Flipkart Style) */}
            {/* ------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8D5A3]/90 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#8C6E2C]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1410]">
                  Check Delivery Availability
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 mb-3">
                Enter your 6-digit delivery PIN code to verify fastest dispatch, dates, and COD.
              </p>

              {/* Pincode Input & Check Form */}
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincodeInput(val);
                      setPincodeError('');
                    }}
                    placeholder="Enter 6-digit Pincode (e.g. 638009)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-mono font-bold tracking-widest text-[#1A1410] placeholder:text-stone-400 placeholder:font-sans placeholder:font-normal focus:outline-none"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={isCheckingPincode || !pincodeInput}
                  className="px-5 py-2.5 rounded-xl bg-[#1A1410] hover:bg-[#2D2018] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isCheckingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {/* Error state */}
              {pincodeError && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pincodeError}</span>
                </div>
              )}

              {/* Quick suggestion chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400 font-medium">Quick hubs:</span>
                {[
                  ['638009', 'Erode (Flagship)'],
                  ['600001', 'Chennai'],
                  ['560001', 'Bengaluru'],
                  ['110001', 'Delhi'],
                ].map(([pin, label]) => (
                  <button
                    key={pin}
                    type="button"
                    onClick={() => {
                      setPincodeInput(pin);
                      const res = resolvePincodeDelivery(pin);
                      setDeliveryInfo(res);
                      localStorage.setItem('acr_delivery_pincode', pin);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                      deliveryInfo?.pin === pin
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-stone-900 font-bold'
                        : 'bg-stone-50 border-stone-200 hover:border-stone-400 text-stone-600'
                    }`}
                  >
                    {pin} · {label}
                  </button>
                ))}
              </div>

              {/* Live Delivery Result Card (Like Amazon/Flipkart) */}
              {deliveryInfo && (
                <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-2.5 animate-fadeIn">
                  {/* Delivery date & service speed */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5A3]/80">
                    <Truck className="w-5 h-5 text-[#8C6E2C] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-xs font-bold text-stone-900">
                          Delivery by <strong className="text-emerald-800 underline underline-offset-2">{deliveryInfo.deliveryDate}</strong>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                          FREE Delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 font-medium">
                        {deliveryInfo.speedText} to <strong className="text-stone-900">{deliveryInfo.city} ({deliveryInfo.pin})</strong>
                      </p>
                    </div>
                  </div>

                  {/* Feature checkmarks */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>7-Day Return & Replacement</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Direct Erode Atelier Dispatch</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Realtime 5-Stage Tracking</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & Purchase CTAs */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8D5A3]/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1410]">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-stone-200 rounded-xl bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-stone-100 text-stone-600 rounded-l-xl transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-stone-800 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-stone-100 text-stone-600 rounded-r-xl transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Bag & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full py-3.5 px-6 rounded-xl border-2 border-[#D4AF37] hover:bg-[#FAF8F5] text-[#8C6E2C] hover:text-[#1A1410] font-serif font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{adding ? 'Adding...' : 'Add to Shopping Bag'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#1A1410] via-[#2A1D15] to-[#1A1410] text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:brightness-110 font-serif font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span>{buyingNow ? 'Processing...' : 'Buy Now'}</span>
                </button>
              </div>

              {/* Direct Artisan Assistance */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                <a
                  href={`https://wa.me/918778824123?text=Hello%20ACR%20Cottons%2C%20I%20am%20interested%20in%20customizing%20dimensions%20for%20${encodeURIComponent(product.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Need Custom Bedding Size? WhatsApp Store</span>
                </a>
                <Link
                  to="/track-order"
                  className="text-[#8C6E2C] hover:underline font-medium"
                >
                  Track Existing Consignment →
                </Link>
              </div>
            </div>

            {/* Fabric Details Highlight Box */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-[#E8D5A3]/70">
                <span className="text-[10px] uppercase font-bold text-[#8C6E2C] block mb-0.5">
                  Fabric Weave
                </span>
                <span className="font-bold text-[#1A1410]">{product.fabric || '100% Combed Cotton'}</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-[#E8D5A3]/70">
                <span className="text-[10px] uppercase font-bold text-[#8C6E2C] block mb-0.5">
                  Colorway & Motif
                </span>
                <span className="font-bold text-[#1A1410]">{product.color || 'Artisanal Jacquard'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products from Same Category */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#E8D5A3]/60">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8C6E2C] block mb-1">
                  Coordinated Atelier Designs
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1410]">
                  You May Also Like
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-[#8C6E2C] hover:text-[#1A1410] underline"
              >
                View Complete Catalog →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* Size Chart Modal */}
        {showSizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E8D5A3] shadow-2xl relative">
              <button
                onClick={() => setShowSizeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900"
              >
                ✕
              </button>
              <h3 className="font-serif text-2xl font-bold text-[#1A1410] mb-2">
                ACR Cottons Bedding Dimension Guide
              </h3>
              <p className="text-xs text-stone-600 mb-6">
                All measurements are tailored to standard Indian and International mattress configurations.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5A3]/70 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#1A1410] block">King Size Bedspread / Duvet</span>
                    <span className="text-stone-500">For 72 × 78 in & 78 × 84 in Master Mattresses</span>
                  </div>
                  <span className="font-mono font-bold text-[#8C6E2C]">104 × 90 in</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5A3]/70 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#1A1410] block">Queen Size Bedspread / Duvet</span>
                    <span className="text-stone-500">For 60 × 78 in Queen Mattresses</span>
                  </div>
                  <span className="font-mono font-bold text-[#8C6E2C]">90 × 90 in</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5A3]/70 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#1A1410] block">Standard Pillowcases & Shams</span>
                    <span className="text-stone-500">Standard Bed Pillows (Pair of 2)</span>
                  </div>
                  <span className="font-mono font-bold text-[#8C6E2C]">18 × 28 in</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5A3]/70 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#1A1410] block">Accent Throw Cushions</span>
                    <span className="text-stone-500">Living Room Sofa & Bedroom Accent</span>
                  </div>
                  <span className="font-mono font-bold text-[#8C6E2C]">16 × 16 in / 18 × 18 in</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSizeModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#1A1410] text-[#D4AF37] font-bold text-xs"
                >
                  Got It, Back to Product
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </StoreLayout>
  );
}
