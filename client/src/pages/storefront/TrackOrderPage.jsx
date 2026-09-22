import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  MessageCircle,
  Mail,
  Phone,
  Crown,
  AlertCircle,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import { orderApi } from '../../services/api.js';

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('id') || searchParams.get('trk') || '';

  const [query, setQuery] = useState(initialQuery);
  const [trackingData, setTrackingData] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (searchCode) => {
    if (!searchCode || !searchCode.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.trackOrder(searchCode.trim());
      if (res.success) {
        setTrackingData(res.order);
        setOrderType(res.type);
      }
    } catch (err) {
      setError(err.message || 'No shipment found for this code. Please check and try again.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ trk: query.trim() });
    fetchTracking(query.trim());
  };

  const timeline = trackingData?.trackingUpdates || [];

  return (
    <StoreLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-[#1A1410] via-[#241A14] to-[#1A1410] text-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            <Crown className="w-3.5 h-3.5" />
            Consignment Tracking Atelier
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            Live Order Tracking
          </h1>
          <p className="text-stone-300 text-sm max-w-xl mx-auto leading-relaxed">
            Enter your ACR Cottons Order ID or Consignment Tracking Number to view real-time artisan weaving, printing, and delivery dispatch milestones.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. ACR-TRK-891024 or ACR-TRK-TSHIRT-5521"
                className="w-full pl-11 pr-4 py-3.5 bg-white text-stone-900 placeholder:text-stone-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-lg font-mono"
              />
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 bg-[#D4AF37] hover:bg-[#C4A35A] text-[#1A1410] font-bold text-sm rounded-2xl shadow-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {loading ? 'Locating...' : 'Track'}
            </button>
          </form>

          {/* Quick Demo Tracking Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-400">
            <span>Try sample tracking numbers:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('ACR-TRK-891024');
                setSearchParams({ trk: 'ACR-TRK-891024' });
                fetchTracking('ACR-TRK-891024');
              }}
              className="text-[#D4AF37] hover:underline font-mono"
            >
              ACR-TRK-891024 (Bedding)
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setQuery('ACR-TRK-TSHIRT-5521');
                setSearchParams({ trk: 'ACR-TRK-TSHIRT-5521' });
                fetchTracking('ACR-TRK-TSHIRT-5521');
              }}
              className="text-[#D4AF37] hover:underline font-mono"
            >
              ACR-TRK-TSHIRT-5521 (Custom T-Shirt)
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-serif text-stone-700">Connecting to Erode Logistics dispatch server...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-card">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Shipment Not Found</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto mb-6">{error}</p>
            <p className="text-xs text-stone-500">
              Need assistance? Speak directly with our Erode atelier concierge at{' '}
              <a href="tel:+918778824123" className="font-bold text-[#8C6E2C] underline">
                +91 87788 24123
              </a>
            </p>
          </div>
        )}

        {trackingData && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Main Consignment Card */}
            <div className="bg-white rounded-3xl border border-[#E8D5A3] shadow-card p-6 sm:p-8">
              {/* Top Meta Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      {orderType === 'CUSTOM_TSHIRT' ? 'Custom T-Shirt Consignment' : 'Luxury Handloom Order'}
                    </span>
                    <span className="text-xs font-bold text-stone-400">·</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        trackingData.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : trackingData.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {trackingData.status}
                    </span>
                  </div>
                  <h2 className="font-mono text-2xl sm:text-3xl font-bold text-stone-900">
                    {trackingData.trackingNumber || trackingData.orderNumber}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Order Ref: <span className="font-mono font-semibold">{trackingData.orderNumber}</span> · Carrier: <strong>{trackingData.carrier || 'Erode Express Logistics'}</strong>
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block">
                    Estimated Delivery
                  </span>
                  <span className="font-serif text-lg font-bold text-stone-900">
                    {trackingData.status === 'CANCELLED'
                      ? 'Order Cancelled'
                      : trackingData.estimatedDelivery
                      ? new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '2–4 Business Days'}
                  </span>
                </div>
              </div>

              {/* Status Alert Banner if Cancelled */}
              {trackingData.status === 'CANCELLED' && (
                <div className="my-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">This Consignment Has Been Cancelled</strong>
                    <span className="text-rose-700">
                      The order was cancelled prior to dispatch. Any payment will be refunded according to bank timelines.
                    </span>
                  </div>
                </div>
              )}

              {/* Status Alert Banner if Cancellable */}
              {['PLACED', 'CONFIRMED', 'DESIGN_CONFIRMED', 'PRINTING'].includes(trackingData.status) && (
                <div className="my-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>
                      Order is in production/packaging. Need to cancel or modify? You can cancel directly from your Profile Dashboard before carrier dispatch.
                    </span>
                  </div>
                  <Link
                    to="/dashboard?tab=orders"
                    className="px-3 py-1.5 bg-[#1A1410] text-[#D4AF37] hover:text-white rounded-xl font-bold text-[11px] whitespace-nowrap self-start sm:self-auto transition-colors"
                  >
                    Open Dashboard
                  </Link>
                </div>
              )}

              {/* Visual 5-Step Progress Timeline */}
              <div className="py-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6E2C] block mb-6">
                  Live Dispatch Milestones
                </span>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[15px] sm:before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8D5A3]">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      {/* Node circle */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          event.completed
                            ? 'bg-[#1A1410] border-[#D4AF37] text-[#D4AF37]'
                            : event.current
                            ? 'bg-[#D4AF37] border-white text-[#1A1410] ring-4 ring-amber-200'
                            : 'bg-white border-stone-300 text-stone-400'
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                        ) : (
                          <span className="text-xs font-bold">{event.step || idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-stone-50/80 rounded-2xl p-4 border border-stone-200/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="font-serif text-base font-bold text-stone-900">
                            {event.title}
                          </h4>
                          {event.timestamp && (
                            <span className="text-[11px] font-mono font-medium text-stone-500">
                              {event.timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consignment Items Snapshot */}
              <div className="pt-6 border-t border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-3">
                  Package Details:
                </span>

                {orderType === 'CUSTOM_TSHIRT' ? (
                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8D5A3] flex flex-col sm:flex-row items-center gap-4">
                    {trackingData.designPreviewUrl && (
                      <img
                        src={trackingData.designPreviewUrl}
                        alt="Custom Print"
                        className="w-16 h-16 object-contain rounded-xl border border-stone-200 bg-white"
                      />
                    )}
                    <div className="flex-1 text-xs">
                      <p className="font-serif text-base font-bold text-stone-900">
                        Customized T-Shirt Printing ({trackingData.totalQuantity} Units)
                      </p>
                      <p className="text-stone-600 mt-0.5">
                        Color: <strong>{trackingData.tshirtColor}</strong> · Fabric: <strong>{trackingData.fabricGsm}</strong>
                      </p>
                      {trackingData.customText && (
                        <p className="text-stone-500 mt-0.5 font-mono">
                          Text: "{trackingData.customText}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 text-sm">
                        ₹{(trackingData.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trackingData.items?.map((it, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center gap-3">
                        {it.imageUrl && (
                          <img
                            src={it.imageUrl}
                            alt={it.title}
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                          />
                        )}
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-stone-900 truncate">{it.title}</p>
                          <p className="text-stone-500">
                            Qty: {it.quantity} {it.size ? `· Size: ${it.size}` : ''}
                          </p>
                        </div>
                        <div className="font-bold text-stone-900 text-xs">
                          ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assistance Card: WhatsApp & Gmail */}
            <div className="bg-gradient-to-br from-[#FAF7F2] to-amber-50/60 rounded-3xl border border-[#E8D5A3] p-6 sm:p-8 shadow-soft">
              <div className="flex items-center gap-2 mb-2 text-[#8C6E2C]">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  Realtime Customer Support
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                Need Help with This Consignment?
              </h3>
              <p className="text-xs text-stone-600 max-w-lg mb-6 leading-relaxed">
                Our atelier managers in Erode are ready to assist you directly via WhatsApp or official Gmail support for delivery rescheduling, size adjustments, or invoice requests.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/918778824123?text=${encodeURIComponent(
                    `Hello ACR Cottons Concierge, I need assistance regarding my order: ${
                      trackingData.trackingNumber || trackingData.orderNumber
                    }.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp (+91 87788 24123)</span>
                </a>

                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=${encodeURIComponent(
                    `Inquiry: Consignment ${trackingData.trackingNumber || trackingData.orderNumber}`
                  )}&body=${encodeURIComponent(
                    `Hello ACR Cottons,\n\nI am tracking my order ${
                      trackingData.trackingNumber || trackingData.orderNumber
                    }.\n\nMy Question:\n`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-white hover:bg-stone-100 text-stone-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-300 shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4 text-rose-600" />
                  <span>Assistance via Gmail (contact@acrprints.com)</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
