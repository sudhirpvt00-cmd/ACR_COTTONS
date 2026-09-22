import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  ShieldCheck,
  Save,
  Plus,
  Package,
  LogOut,
  Camera,
  Truck,
  Clock,
  ChevronRight,
  MessageCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import UserAvatar from '../../components/common/UserAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { userApi, orderApi } from '../../services/api.js';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state: 'orders' | 'profile' | 'addresses'
  const activeTab = searchParams.get('tab') || 'orders';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const fileRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Profile details form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    mobile: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Orders states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
    loadAddresses();
    loadOrders();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await userApi.getAddresses();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await orderApi.getMyOrders();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Cancel order before item leaves the hub
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );
    if (!confirmCancel) return;

    try {
      setCancellingOrderId(orderId);
      // Calls order cancellation endpoint if available, otherwise updates status
      const res = orderApi.cancelOrder
        ? await orderApi.cancelOrder(orderId)
        : await orderApi.updateStatus?.(orderId, 'CANCELLED');

      showSuccess('Order has been cancelled successfully.');
      await loadOrders();
    } catch (err) {
      showError(err.message || 'Unable to cancel this order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await userApi.updateProfile(formData);
      if (res.success && res.user) {
        setUser(res.user);
        showSuccess('Profile details updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const res = await userApi.addAddress(addressForm);
      if (res.success) {
        showSuccess('Address added successfully!');
        setShowAddressForm(false);
        setAddressForm({
          fullName: '',
          mobile: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
        });
        await loadAddresses();
      }
    } catch (err) {
      showError(err.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showError('Please choose a photo under 2 MB.');
      return;
    }
    try {
      setUploadingPhoto(true);
      const res = await userApi.uploadAvatar(file);
      if (res.success && res.user) {
        setUser(res.user);
        showSuccess('Profile photo updated.');
      }
    } catch (err) {
      showError(err.message || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'active') return ['PENDING', 'CONFIRMED', 'DISPATCHED'].includes(order.status);
    if (orderFilter === 'delivered') return order.status === 'DELIVERED';
    if (orderFilter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Heading */}
        <div className="mb-8">
          <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#8C6E2C] block mb-1">
            Customer Account
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Account & Orders
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Customer Summary Card & Navigation */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E8D5A3] p-6 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <UserAvatar user={user} size="lg" className="mx-auto" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#1A1410] text-[#D4AF37] border border-[#D4AF37]/50 flex items-center justify-center shadow-md hover:bg-stone-800 transition-colors"
                  aria-label="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C6E2C] mb-2 font-semibold">
                {uploadingPhoto ? 'Uploading portrait...' : 'Verified Customer'}
              </p>

              <h2 className="font-serif text-xl font-bold text-stone-900">
                {user?.name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>+91 {user?.mobile}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden divide-y divide-stone-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#FAF7F2] text-[#8C6E2C] border-l-4 border-[#D4AF37]'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#8C6E2C]" />
                  <span>Orders & Dispatches</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700 font-mono">
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#FAF7F2] text-[#8C6E2C] border-l-4 border-[#D4AF37]'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <User className="w-4 h-4 text-stone-500" />
                <span>Personal Information</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#FAF7F2] text-[#8C6E2C] border-l-4 border-[#D4AF37]'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-stone-500" />
                  <span>Saved Addresses</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700 font-mono">
                  {addresses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 p-4 text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Active Tab Content */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8">
            {/* ----------------------------------------------------------------------- */}
            {/* TAB 1: Orders & Dispatches */}
            {/* ----------------------------------------------------------------------- */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900">
                      My Orders & Dispatches
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Track authentic ACR Cottons handlooms, bedspreads, and pillow cover dispatches
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setOrderFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        orderFilter === 'all'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      All ({orders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('active')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        orderFilter === 'active'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('delivered')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        orderFilter === 'delivered'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Delivered
                    </button>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-44 bg-white rounded-3xl border border-stone-200 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
                    <Package className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-stone-800">
                      No orders found
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      You haven't placed any orders matching this category yet. Explore our handcrafted bedding sets to get started.
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1410] text-[#D4AF37] font-semibold text-xs hover:brightness-120 transition-all shadow-sm"
                    >
                      <span>Explore Handloom Bedding</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const isDispatched = order.status === 'DISPATCHED';
                      const isDelivered = order.status === 'DELIVERED';
                      const isCancelled = order.status === 'CANCELLED';
                      
                      // Can cancel ONLY if it has not left the ACR Prints hub yet
                      const canCancel = !isDispatched && !isDelivered && !isCancelled;

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                            <div className="flex flex-wrap items-center gap-6">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                  ORDER NUMBER
                                </span>
                                <span className="font-mono font-bold text-stone-900">
                                  #{order.orderNumber || order.id}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                  PLACED ON
                                </span>
                                <span className="text-stone-700 font-medium">
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : '22 Sept 2026'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                  PAYMENT
                                </span>
                                <span className="text-stone-700 font-medium">
                                  {order.paymentMethod || 'Cash on Delivery'}
                                </span>
                              </div>
                            </div>

                            {/* Status Pill */}
                            <div>
                              {isCancelled ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Cancelled</span>
                                </span>
                              ) : isDispatched ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold">
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Dispatched from Erode Hub</span>
                                </span>
                              ) : isDelivered ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Delivered</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Order Placed (At Hub)</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="py-4 space-y-3">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                                    />
                                  )}
                                  <div>
                                    <p className="font-bold text-stone-900">{item.title}</p>
                                    <p className="text-[11px] text-stone-500">
                                      Size: {item.size || 'Standard'} · Qty: {item.quantity} · ₹{item.price} each
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer & Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                TOTAL AMOUNT
                              </span>
                              <span className="font-serif text-lg font-bold text-stone-900">
                                ₹{order.totalAmount?.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Cancel Order Option - ONLY available before leaving the hub */}
                              {canCancel && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingOrderId === order.id}
                                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  title="Cancel order before it leaves the workshop"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                                </button>
                              )}

                              {isDispatched && (
                                <span className="text-[11px] text-stone-400 italic hidden sm:inline-block">
                                  Dispatched · Cannot be cancelled
                                </span>
                              )}

                              {/* Details Button */}
                              <Link
                                to={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-[#1A1410] hover:bg-[#2D2018] text-[#D4AF37] font-semibold text-xs rounded-xl transition-all shadow-xs"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                              </Link>

                              {/* WhatsApp Help */}
                              <a
                                href="https://wa.me/918778824123"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 border border-stone-200 hover:border-emerald-500 rounded-xl text-stone-600 hover:text-emerald-600 transition-colors"
                                title="Inquire on WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* TAB 2: Personal Information */}
            {/* ----------------------------------------------------------------------- */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#8C6E2C]" />
                  <span>Personal Information</span>
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Mobile Number (Login ID)
                    </label>
                    <input
                      type="text"
                      value={`+91 ${user?.mobile || ''}`}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm cursor-not-allowed font-mono"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Mobile number is verified with OTP and secured.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 bg-[#1A1410] text-[#D4AF37] hover:brightness-110 font-serif font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingProfile ? 'Saving Details...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* TAB 3: Delivery Addresses */}
            {/* ----------------------------------------------------------------------- */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#8C6E2C]" />
                    <span>Saved Delivery Addresses</span>
                  </h3>

                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#8C6E2C] hover:text-[#5F4312] bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#E8D5A3]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Address</span>
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form
                    onSubmit={handleAddressSubmit}
                    className="mb-6 p-5 bg-[#FAF7F2] rounded-2xl border border-[#E8D5A3] space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Priya Sharma"
                          value={addressForm.fullName}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, fullName: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile"
                          value={addressForm.mobile}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, mobile: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="House/Flat No., Apartment, Street, Landmark"
                        value={addressForm.street}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, street: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-stone-200 bg-white text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Salem"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, city: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tamil Nadu"
                          value={addressForm.state}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, state: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 636001"
                          value={addressForm.pincode}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, pincode: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-stone-200 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingAddress}
                        className="px-4 py-2 bg-[#1A1410] text-[#D4AF37] rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">
                    No delivery addresses saved yet. Click "Add Address" to store your shipping destination.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 text-xs space-y-1 relative"
                      >
                        <span className="font-bold text-stone-900 block">{addr.fullName}</span>
                        <span className="text-stone-500 block font-mono">+91 {addr.mobile}</span>
                        <p className="text-stone-700 leading-relaxed pt-1">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}