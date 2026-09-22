import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    shippingFee: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setSummary({ itemCount: 0, subtotal: 0, shippingFee: 0, total: 0 });
      return;
    }

    try {
      setLoading(true);
      const data = await cartApi.getCart();
      if (data.success) {
        setCartItems(data.items || []);
        setSummary(
          data.summary || {
            itemCount: 0,
            subtotal: 0,
            shippingFee: 0,
            total: 0,
          }
        );
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, size = null) => {
    if (!user) {
      showError('Please sign in to add items to your shopping bag.');
      return false;
    }

    try {
      const data = await cartApi.addToCart(productId, quantity, size);
      if (data.success) {
        showSuccess(data.message || 'Added to your bag!');
        await fetchCart();
        setIsCartOpen(true);
        return true;
      }
    } catch (err) {
      showError(err.message || 'Could not add to bag');
      return false;
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      const data = await cartApi.updateQuantity(cartItemId, newQty);
      if (data.success) {
        await fetchCart();
      }
    } catch (err) {
      showError(err.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const data = await cartApi.removeFromCart(cartItemId);
      if (data.success) {
        showSuccess('Item removed from your bag');
        await fetchCart();
      }
    } catch (err) {
      showError(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCartItems([]);
      setSummary({ itemCount: 0, subtotal: 0, shippingFee: 0, total: 0 });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        summary,
        itemCount: summary.itemCount,
        subtotal: summary.subtotal,
        shippingFee: summary.shippingFee,
        total: summary.total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
