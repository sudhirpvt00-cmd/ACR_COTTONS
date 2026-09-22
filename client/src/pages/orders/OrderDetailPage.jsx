import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  Printer,
  MessageCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../../components/storefront/Navbar.jsx';
import Footer from '../../components/storefront/Footer.jsx';
import { orderApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const TIMELINE_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Order received & logged' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified by ACR Prints team' },
  { key: 'SHIPPED', label: 'Dispatched', desc: 'Dispatched from Erode textile hub' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Safely delivered to doorstep' },
];

function getStepIndex(status) {
  switch (status) {
    case 'PLACED':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'SHIPPED':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return 0;
  }
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNewOrder = searchParams.get('celebrate') === 'true';
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered wrong size/fabric');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrderById(id);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      showError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await orderApi.cancelOrder(order.id, cancelReason);
      if (res.success) {
        showSuccess('Order has been cancelled successfully.');
        setShowCancelModal(false);
        await fetchOrder();
      }
    } catch (err) {
      showError(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full animate-pulse space-y-6">
          <div className="h-8 w-60 bg-stone-200 rounded-xl" />
          <div className="h-36 bg-white rounded-2xl border border-stone-200" />
          <div className="h-64 bg-white rounded-2xl border border-stone-200" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Order Not Found</h2>
          <p className="text-xs text-stone-600 mb-6">
            The requested order could not be located in our records.
          </p>
          <Link
            to="/orders"
            className="px-6 py-2.5 bg-orange-700 text-white rounded-xl text-xs font-semibold"
          >
            Back to My Orders
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const currentStep = getStepIndex(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED';

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/orders"
            className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Celebratory Banner for newly placed orders */}
        {isNewOrder && (
          <div className="mb-6 p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-2xl shadow-md flex items-center gap-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Thank you for supporting ACR Prints authentic Erode textiles. We will send updates as your package is prepared.
              </p>
            </div>
          </div>
        )}

        {/* Order Header Summary */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Order #{order.orderNumber}
                </h1>
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancelled</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{order.status}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">Placed on {formattedDate}</p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/918778824123?text=${encodeURIComponent(`Hi ACR Prints, I need help with my order #${order.orderNumber}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Support</span>
              </a>

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Progress Stepper (Hidden if Cancelled) */}
          {!isCancelled ? (
            <div className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="relative flex flex-col items-center text-center">
                      {/* Step Circle */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2.5 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-sm'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      {/* Step Labels */}
                      <span
                        className={`text-xs font-bold leading-tight ${
                          isCurrent ? 'text-orange-950' : isCompleted ? 'text-emerald-950' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pt-4 flex items-center gap-3 text-xs text-rose-700 bg-rose-50/70 p-4 rounded-xl border border-rose-100 mt-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Order Cancelled</span>
                <span className="text-[11px] text-rose-600">
                  This order was cancelled. Stock has been returned to inventory. For any inquiries, feel free to contact ACR Prints support.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Items Breakdown */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">
                Items in this Package ({order.items?.length || 0})
              </h2>

              <div className="divide-y divide-stone-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 flex items-start gap-4">
                    <img
                      src={item.imageUrl || '/images/products/pillow_cover_1.jpeg'}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-stone-900">
                        {item.title}
                      </h4>
                      {item.size && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          Option / Size: <span className="font-medium text-stone-800">{item.size}</span>
                        </p>
                      )}
                      <p className="text-xs text-stone-600 mt-1">
                        ₹{item.price?.toLocaleString('en-IN')} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-stone-900 font-mono">
                        ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Delivery Address & Cost Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-stone-700">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Delivery Address</span>
              </div>
              {order.shippingAddress ? (
                <div className="text-xs space-y-1 text-stone-600">
                  <p className="font-bold text-stone-900 text-sm">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="leading-relaxed">
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="text-stone-500 pt-1 font-mono">
                    Mobile: +91 {order.shippingAddress.mobile}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-400">Address snapshot unavailable</p>
              )}
            </div>

            {/* Payment Details Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Payment Breakdown
              </h3>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-semibold text-stone-900">
                    {order.paymentMethod === 'PAY_AT_SHOP' ? 'Store Pickup' : 'Cash on Delivery (COD)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-2.5 flex justify-between items-baseline font-bold text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-lg font-extrabold text-orange-950 font-mono">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Artisan Assurance */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span><strong>Everyday Luxury Handlooms</strong> from Erode, Tamil Nadu.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-stone-200 animate-scale">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Cancel Order #{order.orderNumber}?
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Are you sure you want to cancel this order? Stock will be immediately returned to inventory.
              </p>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none bg-stone-50"
                >
                  <option value="Ordered wrong size/fabric">Ordered wrong size/fabric</option>
                  <option value="Found a different design">Found a different design</option>
                  <option value="Delivery address incorrect">Delivery address incorrect</option>
                  <option value="Placed by mistake">Placed by mistake</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-medium text-stone-700"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
