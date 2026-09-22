import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  Store,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../../components/storefront/Navbar.jsx';
import Footer from '../../components/storefront/Footer.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { userApi, orderApi } from '../../services/api.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, summary, fetchCart, loading: cartLoading } = useCart();
  const { showSuccess, showError } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address form modal/state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    street: '',
    city: 'Erode',
    state: 'Tamil Nadu',
    pincode: '638009',
    isDefault: false,
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'PAY_AT_SHOP'
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch saved addresses
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await userApi.getAddresses();
      if (res.success) {
        setAddresses(res.addresses || []);
        if (res.addresses?.length > 0) {
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddressForm(true);
        }
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Handle saving new address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName.trim() || !newAddress.mobile.trim() || !newAddress.street.trim() || !newAddress.city.trim() || !newAddress.pincode.trim()) {
      showError('Please complete all address fields.');
      return;
    }

    try {
      setSubmittingAddress(true);
      const res = await userApi.addAddress({
        fullName: newAddress.fullName.trim(),
        mobile: newAddress.mobile.trim(),
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        pincode: newAddress.pincode.trim(),
        isDefault: newAddress.isDefault,
      });

      if (res.success) {
        showSuccess('Delivery address added!');
        await loadAddresses();
        setSelectedAddressId(res.address.id);
        setShowAddressForm(false);
      }
    } catch (err) {
      showError(err.message || 'Could not save address');
    } finally {
      setSubmittingAddress(false);
    }
  };

  // Place Order handler
  const handlePlaceOrder = async () => {
    if (!selectedAddressId && addresses.length === 0) {
      showError('Please add and select a delivery address first.');
      setShowAddressForm(true);
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (res.success) {
        showSuccess('Order placed successfully! Thank you for choosing ACR Prints.');
        await fetchCart(); // Refresh cart to empty
        navigate(`/orders/${res.order.id}?celebrate=true`);
      }
    } catch (err) {
      showError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-amber-100/70 rounded-full flex items-center justify-center text-orange-700 mb-6 shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mb-3">
            Your Bag is Empty
          </h2>
          <p className="text-stone-600 text-sm max-w-sm mb-8">
            You don't have any items ready for checkout. Discover our luxury pillow covers and bedding collection.
          </p>
          <Link
            to="/products"
            className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>Explore ACR Prints Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/cart" className="hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shopping Bag</span>
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Secure Checkout</span>
        </div>

        {/* Page Title & Trust Notice */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
              Complete Your Order
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Direct dispatch from ACR Prints (ACR COTTONS) • Erode, Tamil Nadu
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 font-medium self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Encrypted & Safe Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Delivery Address
                  </h2>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {!showAddressForm && (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center">
                      <p className="text-xs text-stone-500 mb-2">
                        No saved delivery address found.
                      </p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs font-bold text-orange-700 hover:underline"
                      >
                        + Add your delivery address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                            isSelected
                              ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-1 ring-orange-500'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-900">
                                  {addr.fullName}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] uppercase tracking-wider font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p className="text-xs text-stone-500 mt-1 font-mono">
                                Mobile: +91 {addr.mobile}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Inline Add New Address Form */}
              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mt-4 p-5 bg-stone-50/70 border border-stone-200 rounded-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Add New Delivery Destination
                    </span>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={newAddress.mobile}
                        onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Door / Flat No., Building & Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="e.g. 14, Gandhipuram Main Road, Surampatti"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="State"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                        placeholder="6-digit PIN"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="saveDefault" className="text-xs text-stone-600 cursor-pointer">
                      Make this my default delivery address
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingAddress}
                      className="px-6 py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-semibold shadow transition-all disabled:opacity-50"
                    >
                      {submittingAddress ? 'Saving...' : 'Save & Select Address'}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    paymentMethod === 'COD'
                      ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-1 ring-orange-500'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Pay with cash or UPI QR scan directly to the courier upon delivery at your doorstep.
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && (
                    <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                  )}
                </div>

                {/* Pay at Store / Shop Pickup */}
                <div
                  onClick={() => setPaymentMethod('PAY_AT_SHOP')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    paymentMethod === 'PAY_AT_SHOP'
                      ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-1 ring-orange-500'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PAY_AT_SHOP"
                      checked={paymentMethod === 'PAY_AT_SHOP'}
                      onChange={() => setPaymentMethod('PAY_AT_SHOP')}
                      className="text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          Pay at Store (Self Pickup)
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          Erode Hub
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Pick up directly from ACR Prints: 2, Sathya Moorthy Street, Surampatti Valasu, Erode.
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'PAY_AT_SHOP' && (
                    <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Review Items in Order */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Review Ordered Items ({cartItems.length})
                  </h2>
                </div>
                <Link
                  to="/cart"
                  className="text-xs font-semibold text-orange-700 hover:underline"
                >
                  Edit Bag
                </Link>
              </div>

              <div className="divide-y divide-stone-100">
                {cartItems.map((item) => {
                  const firstImg = item.product?.images?.[0] || '/images/products/pillow_cover_1.jpeg';
                  return (
                    <div key={item.id} className="py-3 flex items-center gap-4">
                      <img
                        src={firstImg}
                        alt={item.product?.title || 'Product'}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {item.product?.title}
                        </h4>
                        {item.size && (
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Option: {item.size}
                          </p>
                        )}
                        <p className="text-xs text-stone-600 mt-1">
                          Qty: <span className="font-bold text-stone-900">{item.quantity}</span> × ₹{item.product?.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-stone-900 font-mono">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-md">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                Order Total
              </h3>

              <div className="space-y-2.5 text-xs text-stone-600 mb-5">
                <div className="flex justify-between">
                  <span>Items Subtotal ({summary.itemCount} items)</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    ₹{summary.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span>Standard Shipping</span>
                    {summary.shippingFee === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-stone-900 font-mono">
                    {summary.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      `₹${summary.shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (Included)</span>
                  <span className="text-stone-400">Included</span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-base font-bold text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-xl font-extrabold text-orange-950 font-mono">
                    ₹{summary.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Order Placement Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || addresses.length === 0}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:opacity-95 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {addresses.length === 0 && (
                <p className="text-[11px] text-rose-600 text-center mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Please add a delivery address above to place order.</span>
                </p>
              )}

              {/* Assurance Callout */}
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-2.5 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>100% Genuine Handlooms</strong> — Direct from Erode artisans.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span><strong>Express Dispatch</strong> — Prompt packing and tracking updates.</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Assistance Banner */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl flex items-center gap-3 text-xs text-amber-950">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold block">Need help with your order?</span>
                <span className="text-[11px] text-amber-800">
                  Chat directly with our Erode team on WhatsApp (+91 87788 24123).
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
