import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/storefront/Navbar.jsx';
import Footer from '../../components/storefront/Footer.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, summary, updateQuantity, removeFromCart, loading } = useCart();

  const freeShippingThreshold = 1999;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-stone-500">
          <Link to="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Shopping Bag</span>
        </div>

        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-6">
          Your Shopping Bag ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-soft max-w-lg mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Looks like you haven't selected any luxury pillow covers or bedding yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all"
            >
              <span>Explore Bedding Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free delivery banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-950">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  {neededForFreeShipping > 0 ? (
                    <span>
                      Add <strong>₹{neededForFreeShipping.toLocaleString('en-IN')}</strong> more to your bag for <strong>FREE Delivery</strong>
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-800">
                      🎉 You have qualified for FREE Pan-India Delivery!
                    </span>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft divide-y divide-stone-100 overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                      alt={item.product?.title}
                      className="w-24 h-32 object-cover rounded-2xl border border-stone-100 shrink-0 mx-auto sm:mx-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                              {item.product?.category?.name || 'Handloom'}
                            </span>
                            <Link
                              to={`/products/${item.product?.slug}`}
                              className="font-serif text-base font-bold text-stone-900 hover:text-orange-700 line-clamp-2 block mt-0.5"
                            >
                              {item.product?.title}
                            </Link>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-stone-500">
                          {item.product?.fabric && (
                            <span>Fabric: <strong className="text-stone-700">{item.product.fabric}</strong></span>
                          )}
                          {item.size && (
                            <span>Size/Cut: <strong className="text-stone-700">{item.size}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Stepper and Price */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-l-xl transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3.5 text-xs font-bold text-stone-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-r-xl transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-stone-900">
                            ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-stone-400 block">
                              ₹{item.product?.price?.toLocaleString('en-IN')} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-900 pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping for Bedding & Covers</span>
              </Link>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft sticky top-28 space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({summary.itemCount} items)</span>
                    <span className="font-semibold text-stone-900 font-mono">
                      ₹{summary.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Standard Delivery</span>
                    <span>
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

                  <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                    <span>Grand Total</span>
                    <span className="text-lg font-extrabold text-orange-950 font-mono">
                      ₹{summary.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:opacity-95 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Proceed to Delivery & Checkout</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-2 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Genuine Erode Cotton • Everyday Luxury</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Direct dispatch from Erode, Tamil Nadu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
