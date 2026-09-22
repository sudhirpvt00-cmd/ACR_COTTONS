import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  ShoppingBag,
  Package,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  MessageCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Award,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { orderApi, customTshirtApi, shopApi } from '../services/api.js';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'overview' | 'orders' | 'custom' | 'track' | 'heritage' | 'admin'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  useEffect(() => {
    if (tabParam && ['overview', 'orders', 'custom', 'track', 'heritage', 'admin'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Database Data States
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [allOrdersAdmin, setAllOrdersAdmin] = useState([]);
  const [allCustomAdmin, setAllCustomAdmin] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active tracking modal state
  const [selectedTrackingCode, setSelectedTrackingCode] = useState(null);
  const [activeTrackingData, setActiveTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Admin status update state
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Order Cancellation Modal state
  const [cancellingOrder, setCancellingOrder] = useState(null); // { id, orderNumber, totalAmount, type: 'BEDDING' | 'CUSTOM' }
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch all user information and orders from SQLite database
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordRes, custRes, shopRes] = await Promise.all([
        orderApi.getMyOrders().catch(() => ({ orders: [] })),
        customTshirtApi.getMyOrders().catch(() => ({ orders: [] })),
        shopApi.getInfo().catch(() => null),
      ]);

      if (ordRes?.orders) setOrders(ordRes.orders);
      if (custRes?.orders) setCustomOrders(custRes.orders);
      if (shopRes?.shop) setShopInfo(shopRes.shop);

      // If user is admin or for testing, load admin lists
      if (user?.role === 'ADMIN') {
        const [adminOrd, adminCust] = await Promise.all([
          orderApi.getAllAdmin().catch(() => ({ orders: [] })),
          customTshirtApi.getAllAdmin().catch(() => ({ orders: [] })),
        ]);
        if (adminOrd?.orders) setAllOrdersAdmin(adminOrd.orders);
        if (adminCust?.orders) setAllCustomAdmin(adminCust.orders);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    showSuccess('You have been signed out from ACR Cottons.');
    navigate('/login');
  };

  // Open realtime tracking modal for any order
  const handleOpenTracking = async (code) => {
    if (!code) return;
    try {
      setSelectedTrackingCode(code);
      setTrackingLoading(true);
      const res = await orderApi.trackOrder(code);
      if (res.success) {
        setActiveTrackingData(res);
      }
    } catch (err) {
      showError(err.message || 'Tracking information could not be retrieved.');
      setActiveTrackingData(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Admin status update handler
  const handleAdminStatusChange = async (orderId, newStatus, isCustom = false) => {
    try {
      setUpdatingStatusId(orderId);
      if (isCustom) {
        await customTshirtApi.updateStatusAdmin(orderId, { status: newStatus });
      } else {
        await orderApi.updateStatusAdmin(orderId, { status: newStatus });
      }
      showSuccess(`Status updated to ${newStatus} in database.`);
      loadDashboardData();
    } catch (err) {
      showError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Order cancellation handlers
  const handleInitiateCancel = (order, type) => {
    setCancellingOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount,
      type, // 'BEDDING' | 'CUSTOM'
    });
    setCancelReason('Ordered by mistake');
    setCustomCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReason === 'Other'
      ? (customCancelReason.trim() || 'Customer requested cancellation')
      : cancelReason;

    try {
      setCancelLoading(true);
      if (cancellingOrder.type === 'BEDDING') {
        const res = await orderApi.cancelOrder(cancellingOrder.id, finalReason);
        showSuccess(res.message || 'Bedding order cancelled successfully. Handloom stock restored.');
      } else {
        const res = await customTshirtApi.cancelOrder(cancellingOrder.id, finalReason);
        showSuccess(res.message || 'Custom t-shirt printing order cancelled successfully.');
      }
      setCancellingOrder(null);
      await loadDashboardData();
    } catch (err) {
      showError(err.message || 'Could not cancel order. Please contact concierge support.');
    } finally {
      setCancelLoading(false);
    }
  };

  // KPI calculations
  const totalBeddingUnits = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
  const totalCustomTshirts = customOrders.reduce((sum, o) => sum + (o.totalQuantity || 0), 0);
  const activeDispatches =
    orders.filter((o) => o.status === 'SHIPPED' || o.status === 'CONFIRMED').length +
    customOrders.filter((o) => o.status === 'PRINTING' || o.status === 'DISPATCHED').length;

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1A1410] font-sans selection:bg-[#D4AF37]/30">
      {/* ========================================================================= */}
      {/* TOP ROYAL NAV / BRAND BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#1A1410] text-[#FAF7F2] border-b border-[#D4AF37]/30 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#281E17] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-lg group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  ACR COTTONS
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#1A1410] rounded-full">
                  Atelier Dashboard
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.24em] text-[#C4A35A] block">
                Textiles Woven for Everyday Luxury · Erode
              </span>
            </div>
          </Link>

          {/* Quick Support & User Profile */}
          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Concierge Link */}
            <a
              href="https://wa.me/918778824123?text=Hello%20ACR%20Cottons%2C%20I%20am%20contacting%20you%20from%20my%20Dashboard%20for%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Chat with Store on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Concierge</span>
            </a>

            {/* Direct Gmail Assistance Link */}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=Customer%20Support%20Inquiry%20-%20ACR%20Cottons"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-medium transition-colors"
              title="Open Gmail"
            >
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>Gmail Support</span>
            </a>

            {/* Storefront Link */}
            <Link
              to="/products"
              className="px-3.5 py-2 text-xs font-bold text-[#D4AF37] hover:text-white border border-[#D4AF37]/40 rounded-xl transition-all hover:bg-[#D4AF37]/10"
            >
              Browse Catalog
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-800/80 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'orders', label: `Bedding Orders (${orders.length})`, icon: Package },
            { id: 'custom', label: `Custom T-Shirts (${customOrders.length})`, icon: ShoppingBag },
            { id: 'track', label: 'Order Tracking', icon: Truck },
            { id: 'heritage', label: 'Store & Founder Heritage', icon: Award },
            ...(user?.role === 'ADMIN'
              ? [{ id: 'admin', label: 'Admin Production Hub', icon: Sliders }]
              : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#D4AF37] text-[#1A1410] shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Welcome Royal Hero Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#1A1410] via-[#2A1D15] to-[#1A1410] text-[#FAF7F2] p-6 sm:p-10 border border-[#D4AF37]/40 shadow-elevated relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                  <Crown className="w-3.5 h-3.5" />
                  Royal Guild Member · Erode Flagship
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                  Welcome to Your Atelier, {user?.name || 'Valued Patron'}
                </h1>
                <p className="text-stone-300 text-sm leading-relaxed mb-6">
                  Manage your bespoke bedspreads, jacquard cushion orders, and custom-printed cotton t-shirt consignments with end-to-end tracking from Surampatti Valasu, Erode.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/custom-studio"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4AF37] text-[#1A1410] font-serif font-bold text-xs sm:text-sm shadow-md hover:bg-white transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Design Custom T-Shirts (Min 10)</span>
                  </Link>

                  <button
                    onClick={() => setActiveTab('heritage')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span>Visit Shop Location & Founder</span>
                  </button>
                </div>
              </div>

              {/* Decorative aura */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl border border-[#E8D5A3] p-5 sm:p-6 shadow-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Bedding Orders
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {orders.length}
                </span>
                <span className="text-[11px] text-[#8C6E2C] font-semibold block mt-1">
                  {totalBeddingUnits} Total Weaves Placed
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8D5A3] p-5 sm:p-6 shadow-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Custom T-Shirt Orders
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {customOrders.length}
                </span>
                <span className="text-[11px] text-[#8C6E2C] font-semibold block mt-1">
                  {totalCustomTshirts} Custom Shirts Printed
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8D5A3] p-5 sm:p-6 shadow-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Active Dispatches
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-emerald-700">
                  {activeDispatches}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Live Consignments in Transit
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8D5A3] p-5 sm:p-6 shadow-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Atelier Purity
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-6 h-6 text-[#C4A35A]" />
                  <span>100%</span>
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Erode Combed Cotton Heritage
                </span>
              </div>
            </div>

            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom T-Shirt Studio Spotlight Card */}
              <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-3xl border border-[#E8D5A3] p-6 sm:p-8 shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1410] text-[#D4AF37] flex items-center justify-center mb-4 shadow-md">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-1">
                    Bespoke Screen & Digital Printing
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                    Customized T-Shirt Printing Available
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    Upload your corporate artwork or creative emblem onto our virtual 3D T-shirt canvas. Rotate, scale, choose colors, and place bulk orders with a minimum quantity of 10 units.
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8C6E2C]">MOQ: 10 Orders · From ₹239/unit</span>
                  <Link
                    to="/custom-studio"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1410] hover:bg-[#2A1D15] text-[#D4AF37] rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Open 3D Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Order Tracking Spotlight Card */}
              <div className="bg-gradient-to-br from-white to-[#F8F5EE] rounded-3xl border border-[#E8D5A3] p-6 sm:p-8 shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1410] text-[#D4AF37] flex items-center justify-center mb-4 shadow-md">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-1">
                    Realtime Milestones
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                    Universal Consignment Tracking
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    Track the exact progress of every order through 5 precision steps: Loom Setup, Artisan Weaving, Packaging, Air Consignment, and Doorstep Delivery.
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Consignments with Tracking IDs</span>
                  <button
                    onClick={() => setActiveTab('track')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1410] hover:bg-[#2A1D15] text-[#D4AF37] rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Track a Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders List Preview */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-1">
                    Atelier Activity
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Recent Orders & Consignments
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#8C6E2C] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {orders.length === 0 && customOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="font-serif text-lg font-bold text-stone-800">No orders placed yet</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Explore our jacquard bedding collection or customize your first batch of printed t-shirts.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {/* Bedding Orders */}
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {ord.items?.length} items · Tracking ID: <span className="font-mono text-stone-800 font-semibold">{ord.trackingNumber || ord.orderNumber}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          ₹{ord.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleOpenTracking(ord.trackingNumber || ord.orderNumber)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-[#1A1410] hover:text-[#D4AF37] border border-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Custom T-Shirt Orders */}
                  {customOrders.slice(0, 3).map((cord) => (
                    <div key={cord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {cord.designPreviewUrl && (
                          <img
                            src={cord.designPreviewUrl}
                            alt="Design"
                            className="w-12 h-12 object-contain rounded-xl border border-stone-200 bg-white"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-stone-900">
                              {cord.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cord.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : cord.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-purple-100 text-purple-900'
                              }`}
                            >
                              Custom T-Shirt · {cord.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            {cord.totalQuantity} units ({cord.tshirtColor}) · Tracking: <span className="font-mono text-stone-800 font-semibold">{cord.trackingNumber}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          ₹{cord.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleOpenTracking(cord.trackingNumber)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-[#1A1410] hover:text-[#D4AF37] border border-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY BEDDING ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-serif text-3xl font-bold text-stone-900">
                  Bedspreads & Luxury Weaves Orders
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Orders placed from the ACR Cottons flagship catalog stored securely in your database account.
                </p>
              </div>
              <Link
                to="/products"
                className="px-4 py-2 bg-[#1A1410] text-[#D4AF37] rounded-xl text-xs font-bold border border-[#D4AF37]"
              >
                + Browse New Weaves
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">No Orders Yet</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
                  Select handloom bedding, textured shams, or royal bedspreads to place your first order.
                </p>
                <Link
                  to="/products"
                  className="px-6 py-3 bg-[#1A1410] text-[#D4AF37] rounded-2xl text-xs font-bold border border-[#D4AF37]"
                >
                  Explore Bedding Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-base font-bold text-stone-900">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              ord.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-900 border-amber-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Tracking ID:{' '}
                          <span className="font-mono font-semibold text-stone-900">
                            {ord.trackingNumber || ord.orderNumber}
                          </span>{' '}
                          · Carrier: {ord.carrier || 'Erode Express Logistics'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {['PLACED', 'CONFIRMED'].includes(ord.status) && (
                          <button
                            onClick={() => handleInitiateCancel(ord, 'BEDDING')}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenTracking(ord.trackingNumber || ord.orderNumber)}
                          className="px-4 py-2 bg-[#1A1410] text-[#D4AF37] hover:text-white rounded-xl text-xs font-bold border border-[#D4AF37] shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Consignment</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-2">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-14 h-14 object-cover rounded-xl border border-stone-200"
                            />
                          )}
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-bold text-stone-900 text-sm truncate">{item.title}</p>
                            <p className="text-stone-500">
                              Quantity: {item.quantity} {item.size ? `· Size: ${item.size}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-stone-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Row */}
                    <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
                      <div>
                        Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                      </div>
                      <div className="text-right">
                        <span>Total Paid / Payable: </span>
                        <span className="font-mono font-bold text-base text-stone-900 ml-1">
                          ₹{ord.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {ord.status === 'CANCELLED' && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>This order was cancelled prior to dispatch. Handloom items have been restored to our catalog.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CUSTOM T-SHIRT ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'custom' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-serif text-3xl font-bold text-stone-900">
                  Customized T-Shirt Print Projects
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Orders produced with custom client logos and vector designs (Minimum order quantity: 10 units).
                </p>
              </div>

              <Link
                to="/custom-studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1A1410] text-[#D4AF37] font-serif font-bold text-xs shadow-md border border-[#D4AF37]"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Custom Print</span>
              </Link>
            </div>

            {customOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">No Custom T-Shirt Orders Yet</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-6">
                  Use our live 3D visualizer to preview your company emblem or custom graphics on cotton t-shirts (min 10 shirts).
                </p>
                <Link
                  to="/custom-studio"
                  className="px-6 py-3 bg-[#1A1410] text-[#D4AF37] rounded-2xl text-xs font-bold border border-[#D4AF37]"
                >
                  Launch 3D Customizer
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {customOrders.map((cord) => (
                  <div
                    key={cord.id}
                    className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-base font-bold text-stone-900">
                            {cord.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              cord.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : cord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-purple-100 text-purple-900 border-purple-200'
                            }`}
                          >
                            {cord.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Consignment Tracking ID:{' '}
                          <span className="font-mono font-semibold text-stone-900">
                            {cord.trackingNumber}
                          </span>{' '}
                          · Carrier: {cord.carrier || 'DTDC Royal Air Cargo'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {['DESIGN_CONFIRMED', 'PRINTING'].includes(cord.status) && (
                          <button
                            onClick={() => handleInitiateCancel(cord, 'CUSTOM')}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenTracking(cord.trackingNumber)}
                          className="px-4 py-2 bg-[#1A1410] text-[#D4AF37] hover:text-white rounded-xl text-xs font-bold border border-[#D4AF37] shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Production</span>
                        </button>
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {cord.designPreviewUrl && (
                        <div className="w-24 h-24 rounded-2xl bg-[#FAF7F2] border border-stone-200 p-2 flex items-center justify-center shrink-0">
                          <img
                            src={cord.designPreviewUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-1 text-xs text-stone-700">
                        <p className="font-serif text-lg font-bold text-stone-900">
                          {cord.fabricGsm} · {cord.tshirtColor}
                        </p>
                        <p className="text-stone-500">
                          Print Placement: <strong>{cord.printPosition}</strong> · Batch Size:{' '}
                          <strong className="text-stone-900">{cord.totalQuantity} Shirts (MOQ Satisfied)</strong>
                        </p>
                        {cord.sizeBreakdown && (
                          <p className="text-stone-500 font-mono text-[11px]">
                            Sizes: {JSON.stringify(cord.sizeBreakdown).replace(/[{}""]/g, ' ')}
                          </p>
                        )}
                        {cord.customText && (
                          <p className="text-[#8C6E2C] font-semibold">
                            Embroidered/Printed Text: "{cord.customText}"
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Price</span>
                        <span className="font-mono text-xl font-bold text-stone-900">
                          ₹{cord.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          (₹{cord.pricePerUnit} / unit)
                        </span>
                      </div>
                    </div>

                    {cord.status === 'CANCELLED' && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>This custom t-shirt printing project was cancelled. Screen setup and printing halted.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ORDER TRACKING (UNIVERSAL) */}
        {/* ========================================================================= */}
        {activeTab === 'track' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-4 border-b border-stone-200">
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Track Any Shipment
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Enter your Order Number or Tracking Code to view real-time production, packaging, and air courier dispatch milestones.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const code = form.trackingCode.value;
                  handleOpenTracking(code);
                }}
                className="flex gap-2 max-w-xl mb-6"
              >
                <input
                  name="trackingCode"
                  type="text"
                  placeholder="e.g. ACR-TRK-891024 or ACR-TRK-TSHIRT-5521"
                  className="flex-1 py-3 px-4 border border-stone-300 rounded-2xl text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1A1410] text-[#D4AF37] hover:text-white rounded-2xl text-xs font-bold border border-[#D4AF37]"
                >
                  Locate
                </button>
              </form>

              {/* Helper list of user's active tracking codes */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  Your Available Tracking Numbers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleOpenTracking(o.trackingNumber || o.orderNumber)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs font-mono text-stone-800 transition-colors"
                    >
                      📦 {o.trackingNumber || o.orderNumber}
                    </button>
                  ))}
                  {customOrders.map((co) => (
                    <button
                      key={co.id}
                      onClick={() => handleOpenTracking(co.trackingNumber)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-mono text-purple-900 transition-colors"
                    >
                      👕 {co.trackingNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STORE & FOUNDER HERITAGE */}
        {/* ========================================================================= */}
        {activeTab === 'heritage' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Founder Spotlight Card with Owner Picture */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card overflow-hidden grid md:grid-cols-12 gap-8 p-6 sm:p-10">
              {/* Owner Portrait Column */}
              <div className="md:col-span-5 flex flex-col items-center text-center">
                <div className="relative p-2 rounded-3xl bg-gradient-to-tr from-[#1A1410] via-[#C4A35A] to-[#1A1410] shadow-xl mb-4">
                  <img
                    src="/images/owner.jpeg"
                    alt="A.C. Raj Kumar - Founder, ACR Cottons"
                    className="w-56 h-64 sm:w-64 sm:h-72 object-cover object-top rounded-2xl shadow-md"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1A1410] text-[#D4AF37] border border-[#D4AF37] rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-md">
                    Founder & Master Artisan
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                  A.C. RAJ KUMAR
                </h3>
                <p className="text-xs uppercase font-semibold tracking-[0.2em] text-[#8C6E2C]">
                  Visionary Behind ACR Cottons
                </p>
              </div>

              {/* Biography & Story Column */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-[#8C6E2C] text-[11px] font-bold uppercase tracking-wider mb-3 border border-[#E8D5A3]">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Textiles Woven for Everyday Luxury</span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1410] mb-3">
                    From Thread to Treasure
                  </h2>

                  <p className="text-stone-700 text-sm leading-relaxed mb-3">
                    The visionary behind ACR Cottons is dedicated to redefining home comfort through artisanal excellence. Operating out of Erode, Tamil Nadu — prominent textile hub renowned as the <strong>"Textile Valley of South India"</strong> — ACR Cottons crafts premium bedspreads, jacquard pillows, velvet cushions, and customized printed cotton apparel.
                  </p>

                  <p className="text-stone-600 text-xs leading-relaxed mb-4">
                    Our core philosophy focuses on bringing the serene feel of a high-end boutique hotel into everyday residential spaces using rich colors, intricate patterns (like damask and jacquard), and 100% bio-washed combed cotton.
                  </p>
                </div>

                {/* Direct Concierge Contact Row */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8D5A3] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-800">
                    <Phone className="w-4 h-4 text-[#8C6E2C]" />
                    <span>Company Contact: <strong className="font-mono">+91 87788 24123</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-800">
                    <Clock className="w-4 h-4 text-[#8C6E2C]" />
                    <span>Store Timings: <strong>8:00 AM – 8:00 PM, all working days except Sat & Sun</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-800">
                    <MapPin className="w-4 h-4 text-[#8C6E2C]" />
                    <span>2, Sathya Moorthy Street, Surampatti Valasu, Erode – 638009</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Location Map & Direct Navigation */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-1">
                    Store Flagship Address
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Surampatti Valasu, Erode Showroom
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://maps.app.goo.gl/48x6D8xnWNCibc9YA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1410] text-[#D4AF37] hover:text-white border border-[#D4AF37] text-xs font-bold shadow-md transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://wa.me/918778824123?text=Hello%20ACR%20Cottons%2C%20I%20am%20planning%20to%20visit%20your%20Surampatti%20Valasu%20store."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Store</span>
                  </a>
                </div>
              </div>

              {/* Embedded Google Map Frame */}
              <div className="w-full h-96 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100 relative">
                <iframe
                  title="ACR Cottons Store Location"
                  src="https://maps.google.com/maps?q=11.3257665,77.7012776&z=17&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ADMIN PRODUCTION HUB (Available for Admin Role) */}
        {/* ========================================================================= */}
        {activeTab === 'admin' && user?.role === 'ADMIN' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-4 border-b border-stone-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Store Administrator Panel
              </div>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Live Order Production & Status Management
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Advance shipment statuses across both Bedding Orders and Custom T-Shirt Print runs. Status updates instantly update the client-side realtime tracking timeline in SQLite database.
              </p>
            </div>

            {/* Bedding Orders Admin Table */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
                Bedding & Weaves Consignments
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Order / Tracking</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Current Status</th>
                      <th className="p-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {allOrdersAdmin.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold">{o.orderNumber}</td>
                        <td className="p-3">{o.user?.name} ({o.user?.mobile})</td>
                        <td className="p-3 font-mono">₹{o.totalAmount}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={o.status}
                            disabled={updatingStatusId === o.id}
                            onChange={(e) => handleAdminStatusChange(o.id, e.target.value, false)}
                            className="text-xs py-1 px-2 border rounded-lg bg-white font-medium"
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom T-Shirt Admin Table */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
                Custom T-Shirt Print Queue
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Order / Tracking</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {allCustomAdmin.map((co) => (
                      <tr key={co.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold">{co.orderNumber}</td>
                        <td className="p-3">{co.user?.name}</td>
                        <td className="p-3 font-bold">{co.totalQuantity} Shirts</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900">
                            {co.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={co.status}
                            disabled={updatingStatusId === co.id}
                            onChange={(e) => handleAdminStatusChange(co.id, e.target.value, true)}
                            className="text-xs py-1 px-2 border rounded-lg bg-white font-medium"
                          >
                            <option value="DESIGN_CONFIRMED">DESIGN_CONFIRMED</option>
                            <option value="PRINTING">PRINTING</option>
                            <option value="QUALITY_INSPECTION">QUALITY_INSPECTION</option>
                            <option value="DISPATCHED">DISPATCHED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* REALTIME TRACKING MODAL */}
      {/* ========================================================================= */}
      {selectedTrackingCode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#D4AF37] p-6 sm:p-8 shadow-2xl relative my-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block">
                  Consignment Milestone Tracker
                </span>
                <h3 className="font-mono text-xl sm:text-2xl font-bold text-stone-900">
                  {selectedTrackingCode}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedTrackingCode(null);
                  setActiveTrackingData(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {trackingLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-stone-500">Connecting to Erode dispatch database...</p>
              </div>
            ) : activeTrackingData ? (
              <div className="py-6 space-y-6">
                {/* Status & Carrier Row */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8D5A3] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Status</span>
                    <strong className="text-emerald-800 font-bold">{activeTrackingData.order?.status}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Carrier</span>
                    <strong className="text-stone-800">{activeTrackingData.order?.carrier || 'Erode Express Logistics'}</strong>
                  </div>
                </div>

                {/* 5-Step Timeline */}
                <div className="pl-6 space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8D5A3]">
                  {activeTrackingData.order?.trackingUpdates?.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                          step.completed
                            ? 'bg-[#1A1410] border-[#D4AF37] text-[#D4AF37]'
                            : step.current
                            ? 'bg-[#D4AF37] border-white text-[#1A1410] ring-2 ring-amber-200'
                            : 'bg-white border-stone-300 text-stone-400'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                        <div className="flex items-center justify-between">
                          <p className="font-serif font-bold text-sm text-stone-900">{step.title}</p>
                          {step.timestamp && (
                            <span className="text-[10px] font-mono text-stone-500">{step.timestamp}</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cancellation Banner in Tracking Modal if Cancelled */}
                {activeTrackingData.order?.status === 'CANCELLED' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <strong className="block font-bold">Consignment Cancelled</strong>
                      <span>This order was cancelled prior to carrier dispatch.</span>
                    </div>
                  </div>
                )}

                {/* Cancel Action in Tracking Modal before dispatch */}
                {['PLACED', 'CONFIRMED', 'DESIGN_CONFIRMED', 'PRINTING'].includes(activeTrackingData.order?.status) && (
                  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Consignment not dispatched yet. Need to cancel?</span>
                    </div>
                    <button
                      onClick={() => {
                        const isCustom = activeTrackingData.type === 'CUSTOM_TSHIRT';
                        const ord = isCustom
                          ? customOrders.find((o) => o.trackingNumber === selectedTrackingCode || o.orderNumber === selectedTrackingCode) || activeTrackingData.order
                          : orders.find((o) => o.trackingNumber === selectedTrackingCode || o.orderNumber === selectedTrackingCode) || activeTrackingData.order;
                        setSelectedTrackingCode(null);
                        setActiveTrackingData(null);
                        handleInitiateCancel(ord, isCustom ? 'CUSTOM' : 'BEDDING');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors cursor-pointer text-xs shrink-0"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}

                {/* Assistance Row */}
                <div className="pt-4 border-t border-stone-100 flex gap-2">
                  <a
                    href={`https://wa.me/918778824123?text=${encodeURIComponent(
                      `Hello ACR Cottons Concierge, I am tracking consignment: ${selectedTrackingCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Help</span>
                  </a>

                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=${encodeURIComponent(
                      `Inquiry: Consignment ${selectedTrackingCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-300"
                  >
                    <Mail className="w-4 h-4 text-rose-600" />
                    <span>Gmail Help</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER CANCELLATION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-rose-200 p-6 sm:p-8 shadow-2xl relative my-8">
            {/* Header */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 block">
                  Order Cancellation Request
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Cancel Order #{cancellingOrder.orderNumber}?
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Total Value: <span className="font-bold text-stone-800">₹{cancellingOrder.totalAmount?.toLocaleString('en-IN')}</span> · {cancellingOrder.type === 'BEDDING' ? 'Bedding Handloom Order' : 'Custom T-Shirt Print Order'}
                </p>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                disabled={cancelLoading}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="py-4 space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                {cancellingOrder.type === 'BEDDING'
                  ? 'Are you sure you want to cancel this bedding order? Handloom items will be released back to the Erode loom inventory, and payment will be refunded to your original method.'
                  : 'Are you sure you want to cancel this custom t-shirt printing batch? Production will be immediately halted.'}
              </p>

              {/* Reason Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Please choose a reason for cancellation:
                </label>
                <div className="space-y-2">
                  {[
                    'Ordered by mistake',
                    'Want to change size, color, or dimensions',
                    'Found alternative / Changed mind',
                    'Delivery timeframe too long',
                    'Incorrect shipping or contact details',
                    'Other',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        cancelReason === reason
                          ? 'border-[#D4AF37] bg-amber-50/40 text-stone-900 font-semibold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span className="text-xs">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {cancelReason === 'Other' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Provide additional details:
                  </label>
                  <textarea
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    rows={2}
                    placeholder="Tell us what went wrong so we can improve..."
                    className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {/* Reassurance Alert */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8D5A3] flex items-center gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-[#8C6E2C] shrink-0" />
                <span>ACR Cottons Concierge Guarantee: Hassle-free cancellations prior to carrier dispatch.</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={cancelLoading}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Keep My Order
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {cancelLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Order Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
