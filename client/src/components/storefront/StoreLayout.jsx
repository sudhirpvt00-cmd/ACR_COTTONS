import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';
import SupportDock from './SupportDock.jsx';

export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen bg-ivory text-espresso flex flex-col selection:bg-gold-200 selection:text-espresso">
      <div className="luxury-grain pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
        <SupportDock />
      </div>
    </div>
  );
}
