import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import HomePage from './pages/storefront/HomePage.jsx';
import ProductListPage from './pages/storefront/ProductListPage.jsx';
import ProductDetailPage from './pages/storefront/ProductDetailPage.jsx';
import ContactPage from './pages/storefront/ContactPage.jsx';
import LocationPage from './pages/storefront/LocationPage.jsx';
import CartPage from './pages/cart/CartPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import CheckoutPage from './pages/orders/CheckoutPage.jsx';
import OrderDetailPage from './pages/orders/OrderDetailPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import CustomStudioPage from './pages/storefront/CustomStudioPage.jsx';
import TrackOrderPage from './pages/storefront/TrackOrderPage.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/profile?tab=orders" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/profile?tab=orders" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/profile?tab=orders" replace /> : <ForgotPasswordPage />}
      />

      {/* Storefront Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/custom-studio" element={<CustomStudioPage />} />
      <Route path="/track-order" element={<TrackOrderPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/location" element={<LocationPage />} />

      {/* User Shopping & Profile Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      {/* Orders redirect straight into the Profile Orders Tab */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Navigate to="/profile?tab=orders" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy Dashboard Route Redirects Directly to Profile Orders */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to="/profile?tab=orders" replace />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}