import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  Crown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ZoomIn,
  Move,
  Type,
  Truck,
  ShieldCheck,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { customTshirtApi } from '../../services/api.js';

const TSHIRT_COLORS = [
  { name: 'Pure White', hex: '#FFFFFF', border: '#E5E7EB', textDark: true },
  { name: 'Royal Charcoal', hex: '#1C1C1E', border: '#333333', textDark: false },
  { name: 'Regal Navy', hex: '#0F2537', border: '#1E3A56', textDark: false },
  { name: 'Imperial Maroon', hex: '#58111A', border: '#7A1824', textDark: false },
  { name: 'Forest Emerald', hex: '#163326', border: '#234D3A', textDark: false },
  { name: 'Heather Grey', hex: '#9E9EA7', border: '#B5B5BE', textDark: true },
  { name: 'Royal Gold', hex: '#C5A059', border: '#D4AF37', textDark: true },
];

const FABRIC_OPTIONS = [
  {
    id: '180gsm',
    name: '180 GSM Bio-Washed Combed Cotton',
    badge: 'Artisanal Classic',
    basePrice: 299,
    description: '100% long-staple combed cotton from Erode mills. Silky smooth, breathable, and pre-shrunk.',
  },
  {
    id: '220gsm',
    name: '220 GSM Heavyweight Royal Cotton',
    badge: 'Boutique Luxury',
    basePrice: 349,
    description: 'Heavyweight architectural cotton with luxury dense drape. Ideal for premium brand merchandising.',
  },
];

export default function CustomStudioPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  // Customizer state
  const [selectedColor, setSelectedColor] = useState(TSHIRT_COLORS[0]);
  const [selectedFabric, setSelectedFabric] = useState(FABRIC_OPTIONS[0]);
  const [viewSide, setViewSide] = useState('front'); // 'front' | 'back'
  const [printPosition, setPrintPosition] = useState('Front Chest');

  // Artwork & text state
  const [designUrl, setDesignUrl] = useState(null);
  const [designName, setDesignName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Custom text
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#D4AF37');
  const [textFont, setTextFont] = useState('font-serif');

  // Size distribution (MOQ: minimum 10 total)
  const [sizes, setSizes] = useState({
    S: 2,
    M: 3,
    L: 3,
    XL: 2,
    XXL: 0,
  });

  // Shipping & order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    street: '',
    city: 'Erode',
    state: 'Tamil Nadu',
    pincode: '638009',
    notes: '',
  });

  const fileInputRef = useRef(null);

  // Total quantity calculation
  const totalQuantity = Object.values(sizes).reduce((sum, q) => sum + (parseInt(q, 10) || 0), 0);
  const isMoqMet = totalQuantity >= 10;
  const moqDeficit = Math.max(0, 10 - totalQuantity);

  // Dynamic pricing tier
  let unitPrice = selectedFabric.basePrice;
  if (totalQuantity >= 50) {
    unitPrice = Math.round(selectedFabric.basePrice * 0.8); // 20% discount
  } else if (totalQuantity >= 25) {
    unitPrice = Math.round(selectedFabric.basePrice * 0.9); // 10% discount
  }
  const totalAmount = unitPrice * totalQuantity;

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    setUploading(true);
    setDesignName(file.name);

    // Read as Data URL for instant realistic client canvas mockup
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDesignUrl(ev.target.result);
      setUploading(false);
      showSuccess('Design artwork loaded into virtual t-shirt preview!');
    };
    reader.readAsDataURL(file);
  };

  // Sample quick designs
  const loadSampleDesign = (url, name) => {
    setDesignUrl(url);
    setDesignName(name);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    showInfo(`Applied sample design: ${name}`);
  };

  const handleSizeChange = (sizeKey, delta) => {
    setSizes((prev) => {
      const current = prev[sizeKey] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [sizeKey]: next };
    });
  };

  // Order submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      showInfo('Please sign in or create an account to finalize your customized print order.');
      navigate('/login', { state: { from: { pathname: '/custom-studio' } } });
      return;
    }

    if (!isMoqMet) {
      showError(`Minimum order quantity is 10 shirts. Please add ${moqDeficit} more to proceed.`);
      return;
    }

    if (!designUrl && !customText.trim()) {
      showError('Please upload a design logo or add custom text to print on the shirts.');
      return;
    }

    if (!shippingForm.fullName || !shippingForm.mobile || !shippingForm.street || !shippingForm.pincode) {
      showError('Please fill all required delivery address fields.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        tshirtColor: selectedColor.name,
        fabricGsm: selectedFabric.name,
        printPosition,
        designPreviewUrl: designUrl || 'TEXT_ONLY_CUSTOM_PRINT',
        customText: customText.trim() || null,
        textColor,
        sizeBreakdown: sizes,
        totalQuantity,
        shippingAddress: {
          fullName: shippingForm.fullName,
          mobile: shippingForm.mobile,
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          pincode: shippingForm.pincode,
        },
        notes: shippingForm.notes,
      };

      const res = await customTshirtApi.createOrder(payload);
      if (res.success) {
        setOrderSuccessData(res.order);
        showSuccess(`Order placed! Tracking ID: ${res.trackingNumber}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to submit custom order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <StoreLayout>
      {/* Royal Header Section */}
      <section className="bg-gradient-to-b from-[#1A1410] via-[#241A14] to-[#1A1410] text-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            <Crown className="w-3.5 h-3.5" />
            ACR Cottons Bespoke Atelier
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            Virtual Customized T-Shirt Printing Studio
          </h1>
          <p className="max-w-2xl text-stone-300 text-sm sm:text-base leading-relaxed">
            Upload your signature emblem, vector design, or corporate logo and visualize it in real-time on our 100% Erode combed cotton shirts.
            <span className="block mt-1 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
              ✦ Minimum Order Quantity: 10 Units · Direct Loom & Screen Printing Pricing ✦
            </span>
          </p>
        </div>
      </section>

      {/* Main Studio Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================================== */}
          {/* LEFT: Live Interactive Virtual T-Shirt Canvas (7 Cols) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
            {/* View & Position Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewSide('front')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewSide === 'front'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Front View
                </button>
                <button
                  onClick={() => setViewSide('back')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewSide === 'back'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Back View
                </button>
              </div>

              {/* Reset controls */}
              <button
                onClick={() => {
                  setScale(1);
                  setOffsetX(0);
                  setOffsetY(0);
                  setRotation(0);
                }}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors"
                title="Reset Artwork Alignment"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Alignment</span>
              </button>
            </div>

            {/* Virtual T-Shirt Realistic Canvas Display */}
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center p-4">
              {/* T-Shirt SVG Realistic Mockup Base */}
              <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-2xl">
                <svg
                  viewBox="0 0 500 500"
                  className="w-full h-full transition-colors duration-300"
                  style={{ fill: selectedColor.hex }}
                >
                  <defs>
                    <linearGradient id="tshirtShade" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
                    </linearGradient>
                    <filter id="fabricTexture">
                      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0" />
                      <feComposite in2="SourceGraphic" in="gl" operator="in" />
                    </filter>
                  </defs>

                  {/* Body Silhouette */}
                  <path
                    d="M 160 50 
                       Q 200 80 250 80 
                       Q 300 80 340 50 
                       L 430 110 
                       L 380 180 
                       L 330 150 
                       L 340 450 
                       Q 250 460 160 450 
                       L 170 150 
                       L 120 180 
                       L 70 110 
                       Z"
                    stroke={selectedColor.hex === '#FFFFFF' ? '#D1D5DB' : 'rgba(0,0,0,0.3)'}
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  {/* Collar */}
                  <path
                    d="M 200 65 Q 250 105 300 65 Q 250 80 200 65 Z"
                    fill="none"
                    stroke={selectedColor.hex === '#FFFFFF' ? '#9CA3AF' : 'rgba(255,255,255,0.2)'}
                    strokeWidth="4"
                  />

                  {/* Shading overlay */}
                  <path
                    d="M 160 50 Q 200 80 250 80 Q 300 80 340 50 L 430 110 L 380 180 L 330 150 L 340 450 Q 250 460 160 450 L 170 150 L 120 180 L 70 110 Z"
                    fill="url(#tshirtShade)"
                  />

                  {/* Inner brand tag */}
                  <text
                    x="250"
                    y="115"
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="serif"
                    fill={selectedColor.textDark ? '#7A6B5D' : '#D4AF37'}
                    opacity="0.8"
                    letterSpacing="2"
                  >
                    ACR COTTONS · ERODE
                  </text>
                </svg>

                {/* Print Bounding Box Overlay on Chest Area */}
                <div
                  className={`absolute w-44 h-52 border border-dashed rounded-xl flex items-center justify-center pointer-events-none transition-all ${
                    viewSide === 'front' ? 'top-[30%]' : 'top-[28%]'
                  } ${
                    selectedColor.textDark
                      ? 'border-stone-400/40'
                      : 'border-white/30'
                  }`}
                >
                  <span
                    className={`absolute -top-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      selectedColor.textDark ? 'bg-stone-200 text-stone-700' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {viewSide === 'front' ? 'Print Zone (Front)' : 'Print Zone (Back)'}
                  </span>

                  {/* Uploaded Artwork on Virtual T-Shirt */}
                  {designUrl ? (
                    <div
                      className="transition-transform duration-100 ease-out select-none"
                      style={{
                        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
                      }}
                    >
                      <img
                        src={designUrl}
                        alt="Uploaded Custom Design"
                        className="max-w-[150px] max-h-[160px] object-contain drop-shadow-sm pointer-events-auto"
                        style={{
                          mixBlendMode: selectedColor.hex === '#FFFFFF' ? 'multiply' : 'normal',
                        }}
                      />
                    </div>
                  ) : null}

                  {/* Custom Text Overlay */}
                  {customText.trim() && (
                    <div
                      className={`absolute bottom-6 text-center select-none font-bold tracking-wider ${textFont}`}
                      style={{
                        color: textColor,
                        fontSize: `${14 * scale}px`,
                        transform: `translate(${offsetX}px, ${offsetY + 30}px) rotate(${rotation}deg)`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      {customText}
                    </div>
                  )}

                  {!designUrl && !customText.trim() && (
                    <div className="text-center p-3 opacity-60">
                      <Upload className={`w-8 h-8 mx-auto mb-1 ${selectedColor.textDark ? 'text-stone-500' : 'text-stone-300'}`} />
                      <p className={`text-[11px] font-medium ${selectedColor.textDark ? 'text-stone-600' : 'text-stone-300'}`}>
                        Upload design to visualize on shirt
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Design Tuning Sliders */}
            {(designUrl || customText.trim()) && (
              <div className="w-full mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-[#C4A35A]" />
                    Artwork Scale ({Math.round(scale * 100)}%)
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-36 accent-[#1A1410]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#C4A35A]" />
                    Vertical Position
                  </span>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="2"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                    className="w-36 accent-[#1A1410]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#C4A35A]" />
                    Horizontal Position
                  </span>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="2"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                    className="w-36 accent-[#1A1410]"
                  />
                </div>
              </div>
            )}

            {/* Sample Designs Row */}
            <div className="w-full mt-4 pt-4 border-t border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Try Sample ACR Cottons Artworks:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadSampleDesign('/images/products/pillow_cover_5.jpeg', 'Erode Heritage Damask')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-[#FAF7F2] hover:border-[#D4AF37] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors"
                >
                  🏛️ Erode Heritage Emblem
                </button>
                <button
                  onClick={() => loadSampleDesign('/images/products/pillow_cover_1.jpeg', 'Artisanal Jacquard Seal')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-[#FAF7F2] hover:border-[#D4AF37] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors"
                >
                  🌿 Royal Botanical Seal
                </button>
                <button
                  onClick={() => {
                    setCustomText('ACR COTTONS · ERODE');
                    setTextColor('#D4AF37');
                    showInfo('Added custom embroidery text preview');
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-[#FAF7F2] hover:border-[#D4AF37] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors"
                >
                  ✍️ Add Gold Text
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT: Customizer Configuration & MOQ Validation (5 Cols) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 space-y-6">
            {/* Color Selector */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-2">
                1. Select Apparel Color
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                {selectedColor.name}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {TSHIRT_COLORS.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor.name === col.name
                        ? 'ring-2 ring-offset-2 ring-[#D4AF37] scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex, borderColor: col.border }}
                    title={col.name}
                  >
                    {selectedColor.name === col.name && (
                      <CheckCircle2
                        className={`w-5 h-5 ${col.textDark ? 'text-stone-900' : 'text-white'}`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Design Artwork Box */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-2">
                2. Upload Your Custom Design
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                Artwork / Logo Vector
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#D4AF37] bg-stone-50/70 hover:bg-[#FAF7F2] p-5 rounded-2xl text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-[#C4A35A] mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-900">
                  {designName ? `Selected: ${designName}` : 'Click to Upload Artwork (PNG, JPG, SVG)'}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  High-res recommended · Supports transparent backgrounds
                </p>
              </div>

              {/* Optional Custom Text Input */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Add Custom Tagline / Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACR COTTONS 2026"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full text-xs font-medium py-2.5 px-3 bg-stone-50 border border-stone-200 focus:border-[#D4AF37] rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Fabric Choice */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-2">
                3. Choose Cotton Grade
              </span>
              <div className="space-y-3">
                {FABRIC_OPTIONS.map((fab) => (
                  <div
                    key={fab.id}
                    onClick={() => setSelectedFabric(fab)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedFabric.id === fab.id
                        ? 'border-[#D4AF37] bg-amber-50/30'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">{fab.name}</span>
                      <span className="font-serif font-bold text-stone-900 text-sm">
                        ₹{fab.basePrice} <span className="text-[10px] text-stone-500 font-sans">/ unit</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      {fab.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* STRICT MOQ VALIDATION & QUANTITY BREAKDOWN */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C]">
                  4. Size Breakdown
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isMoqMet
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isMoqMet ? 'MOQ Satisfied (≥10)' : 'Min 10 Orders Required'}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                Total Units: <span className="font-mono text-2xl">{totalQuantity}</span>
              </h3>

              {/* Alert if MOQ is not met */}
              {!isMoqMet && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Requirement:</strong> Customized t-shirt printing requires a minimum order of <strong>10 shirts</strong>. Please add <strong>{moqDeficit} more</strong> to enable order placement.
                  </span>
                </div>
              )}

              {/* Size Steppers */}
              <div className="grid grid-cols-5 gap-2 text-center">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <div key={sz} className="p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[11px] font-bold text-stone-700 block mb-1">{sz}</span>
                    <span className="font-mono font-bold text-sm block mb-1.5">{sizes[sz]}</span>
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleSizeChange(sz, -1)}
                        className="w-5 h-5 bg-white border border-stone-300 rounded text-stone-600 hover:bg-stone-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleSizeChange(sz, 1)}
                        className="w-5 h-5 bg-[#1A1410] text-white rounded hover:bg-stone-800 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown row */}
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span className="font-bold text-stone-900">₹{unitPrice} / shirt</span>
                </div>
                {totalQuantity >= 25 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Volume Tier Discount:</span>
                    <span>Applied (Up to 20% off)</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-lg text-stone-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Order Placement Action Button */}
              <div className="mt-5">
                <button
                  type="button"
                  disabled={!isMoqMet || (!designUrl && !customText.trim())}
                  onClick={() => setShowOrderModal(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1A1410] via-[#2B1D16] to-[#1A1410] border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white font-serif font-bold text-base tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {isMoqMet
                      ? 'Confirm Design & Place Custom Order'
                      : `Add ${moqDeficit} More to Reach Min 10 Orders`}
                  </span>
                  {isMoqMet && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ORDER CHECKOUT MODAL */}
      {/* ========================================================================= */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#D4AF37] p-6 sm:p-8 shadow-2xl relative my-8 animate-fadeIn">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">
              Finalize Custom Print Order
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Enter your shipping information. A dedicated tracking consignment will be generated upon confirmation.
            </p>

            {/* Order Summary Pill */}
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8D5A3] mb-5 text-xs text-stone-700 space-y-1">
              <div className="flex justify-between">
                <span>Color & Fabric:</span>
                <strong>{selectedColor.name} · {selectedFabric.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Units:</span>
                <strong>{totalQuantity} Units (MOQ Satisfied)</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <strong className="text-stone-900 text-sm">₹{totalAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Shipping Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={shippingForm.fullName}
                  onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                  className="w-full py-2 px-3 text-xs border rounded-xl"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={shippingForm.mobile}
                  onChange={(e) => setShippingForm({ ...shippingForm, mobile: e.target.value })}
                  className="w-full py-2 px-3 text-xs border rounded-xl font-mono"
                  placeholder="10-digit mobile"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingForm.street}
                  onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                  className="w-full py-2 px-3 text-xs border rounded-xl"
                  placeholder="Street / Flat / Colony"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    className="w-full py-2 px-2 text-xs border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.state}
                    onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    className="w-full py-2 px-2 text-xs border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingForm.pincode}
                    onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                    className="w-full py-2 px-2 text-xs border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="flex-1 py-3 bg-[#1A1410] text-[#D4AF37] hover:text-white border border-[#D4AF37] rounded-xl text-xs font-bold shadow-lg"
                >
                  {submittingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER SUCCESS & TRACKING MODAL */}
      {/* ========================================================================= */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-[#D4AF37] p-6 sm:p-8 shadow-2xl relative my-8 animate-fadeIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-1">
                Atelier Order Registered
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Custom Order Placed!
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Your custom batch order of {orderSuccessData.totalQuantity} t-shirts has entered our Erode production queue.
              </p>
            </div>

            {/* Tracking ID Badge */}
            <div className="p-4 bg-gradient-to-r from-[#1A1410] to-[#2E1E16] text-white rounded-2xl border border-[#D4AF37]/50 shadow-md text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
                Official Consignment Tracking ID
              </span>
              <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-white">
                {orderSuccessData.trackingNumber}
              </span>
              <p className="text-[10px] text-stone-300 mt-1">
                Carrier: {orderSuccessData.carrier || 'DTDC Royal Air Cargo'}
              </p>
            </div>

            {/* Direct WhatsApp Concierge Button */}
            <div className="space-y-2 mb-6">
              <a
                href={`https://wa.me/918778824123?text=${encodeURIComponent(
                  `Hello ACR Cottons, I just placed a custom T-Shirt order with Tracking ID: ${orderSuccessData.trackingNumber}. Quantity: ${orderSuccessData.totalQuantity} units.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify ACR Cottons on WhatsApp (+91 87788 24123)</span>
              </a>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=${encodeURIComponent(
                  `Inquiry regarding Custom Order ${orderSuccessData.trackingNumber}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-stone-300"
              >
                <Mail className="w-4 h-4 text-rose-600" />
                <span>Send Assistance Request via Gmail</span>
              </a>
            </div>

            {/* Dashboard Redirect Action */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-[#1A1410] text-[#D4AF37] hover:text-white rounded-xl text-xs font-bold border border-[#D4AF37] shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>View in Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setOrderSuccessData(null);
                  setShowOrderModal(false);
                }}
                className="py-3 px-4 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
