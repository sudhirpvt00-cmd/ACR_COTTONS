import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isCartOpen, closeCart, cartItems, summary, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1999;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-in">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-700" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Shopping Bag ({summary.itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100/80 text-xs text-amber-950 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            {neededForFreeShipping > 0 ? (
              <span>
                Add <strong className="text-amber-900 font-bold">₹{neededForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong>FREE Pan-India Delivery</strong>
              </span>
            ) : (
              <span className="text-emerald-800 font-bold">
                🎉 Congratulations! You unlocked FREE Delivery!
              </span>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Discover our luxury pillowcases, velvet lumbar cushions, and damask bedspreads.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/products');
                  }}
                  className="px-5 py-2.5 bg-orange-700 text-white rounded-xl text-xs font-semibold hover:bg-orange-800 transition-colors"
                >
                  Explore Bedding
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                    alt={item.product?.title}
                    className="w-20 h-24 object-cover rounded-xl border border-stone-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/products/${item.product?.slug}`}
                          onClick={closeCart}
                          className="text-xs font-bold text-stone-900 hover:text-orange-700 line-clamp-2"
                        >
                          {item.product?.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-300 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.size && (
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          Option: {item.size}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-sm font-extrabold text-stone-900">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/70">
              <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ₹{summary.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span className="font-semibold text-stone-900">
                    {summary.shippingFee === 0 ? (
                      <span className="text-emerald-700 uppercase font-bold">FREE</span>
                    ) : (
                      `₹${summary.shippingFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-stone-900">
                  <span>Estimated Total</span>
                  <span className="text-base text-orange-950 font-extrabold">
                    ₹{summary.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:opacity-95 text-white font-semibold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 group transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => {
                    closeCart();
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 bg-transparent hover:bg-stone-200/60 text-stone-700 font-semibold rounded-xl text-xs transition-all text-center cursor-pointer"
                >
                  View Full Shopping Bag
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine Handlooms • Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
