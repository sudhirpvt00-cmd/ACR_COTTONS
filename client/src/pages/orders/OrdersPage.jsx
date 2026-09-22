import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../../components/storefront/Navbar.jsx';
import Footer from '../../components/storefront/Footer.jsx';
import { orderApi } from '../../services/api.js';

function getStatusBadge(status) {
  switch (status) {
    case 'PLACED':
      return {
        label: 'Order Placed',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock,
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmed by ACR Prints',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: CheckCircle2,
      };
    case 'SHIPPED':
      return {
        label: 'Dispatched from Erode',
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        icon: Truck,
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: XCircle,
      };
    default:
      return {
        label: status,
        bg: 'bg-stone-50 text-stone-800 border-stone-200',
        icon: Clock,
      };
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ACTIVE') {
      return ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(order.status);
    }
    if (filter === 'DELIVERED') {
      return order.status === 'DELIVERED';
    }
    if (filter === 'CANCELLED') {
      return order.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
              My Orders & Dispatches
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Track your authentic ACR Prints handlooms, bedspreads, and pillow cover orders
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs self-start sm:self-auto">
            {[
              { key: 'ALL', label: `All (${orders.length})` },
              {
                key: 'ACTIVE',
                label: `Active (${orders.filter((o) => ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(o.status)).length})`,
              },
              {
                key: 'DELIVERED',
                label: `Delivered (${orders.filter((o) => o.status === 'DELIVERED').length})`,
              },
              {
                key: 'CANCELLED',
                label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-white text-orange-950 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse space-y-4"
              >
                <div className="h-5 w-48 bg-stone-200 rounded" />
                <div className="h-16 w-full bg-stone-100 rounded-xl" />
                <div className="h-4 w-32 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-orange-700 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              {filter === 'ALL' ? 'No Orders Placed Yet' : `No ${filter.toLowerCase()} orders`}
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              Explore our luxury pillowcases, woven damask bedspreads, and handcrafted sets curated directly from Erode, Tamil Nadu.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-xl text-xs font-semibold shadow-md hover:opacity-95 transition-all"
            >
              <span>Explore ACR Prints Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const BadgeIcon = badge.icon;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Order Header Bar */}
                  <div className="bg-stone-50/80 px-5 py-3.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                          Order Number
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <div className="hidden sm:block border-l border-stone-200 h-6" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                          Placed On
                        </span>
                        <span className="text-stone-700 font-medium">{formattedDate}</span>
                      </div>
                      <div className="hidden sm:block border-l border-stone-200 h-6" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                          Payment
                        </span>
                        <span className="text-stone-700 font-medium">
                          {order.paymentMethod === 'PAY_AT_SHOP' ? 'Store Pickup' : 'Cash on Delivery'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Body: Items Preview & Actions */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3.5">
                          <img
                            src={item.imageUrl || '/images/products/pillow_cover_1.jpeg'}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {item.title}
                            </h4>
                            {item.size && (
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Size: {item.size}
                              </p>
                            )}
                            <p className="text-xs text-stone-600 mt-0.5">
                              Qty: <span className="font-bold text-stone-800">{item.quantity}</span> • ₹{item.price} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-stone-100 gap-4 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">
                          Total Amount
                        </span>
                        <span className="text-lg font-extrabold text-orange-950 font-mono">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                          to={`/orders/${order.id}`}
                          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
                        >
                          <span>Track & View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        <a
                          href={`https://wa.me/918778824123?text=${encodeURIComponent(`Hi ACR Prints, I would like to inquire about my order #${order.orderNumber}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 border border-stone-200 hover:bg-stone-50 text-emerald-700 rounded-xl transition-colors shrink-0"
                          title="Contact WhatsApp Support"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
