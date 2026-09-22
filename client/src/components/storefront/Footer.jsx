import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Truck,
  Award,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { shopApi } from '../../services/api.js';

export default function Footer() {
  const [shop, setShop] = useState({
    shopName: 'ACR COTTONS',
    legalName: 'ACR COTTONS',
    founder: 'A.C. RAJ KUMAR',
    tagline: 'Textiles Woven for Everyday Luxury',
    phone: '+91 87788 24123',
    whatsapp: '+91 87788 24123',
    email: 'contact@acrprints.com',
    mapUrl: 'https://maps.app.goo.gl/48x6D8xnWNCibc9YA',
    address: {
      storeName: 'ACR COTTONS Flagship Atelier',
      street: '2, Sathya Moorthy Street, Surampatti Valasu',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638009',
    },
    openingHours: '8:00 AM - 8:00 PM, all working days except Saturday and Sunday',
  });

  useEffect(() => {
    async function loadShop() {
      try {
        const data = await shopApi.getInfo();
        if (data.success && data.shop) {
          setShop(data.shop);
        }
      } catch (err) {
        console.error('Failed to load shop details:', err);
      }
    }
    loadShop();
  }, []);

  const whatsappUrl = `https://wa.me/918778824123?text=${encodeURIComponent(
    'Hello ACR Cottons! I would like to inquire about luxury bedding, store visits, or custom t-shirt printing.'
  )}`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=${encodeURIComponent(
    'Inquiry to ACR Cottons Concierge'
  )}`;

  return (
    <footer className="bg-[#110E0C] text-stone-300 pt-16 pb-12 border-t border-[#D4AF37]/30 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Assurance Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1410] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Erode Textile Valley</h4>
              <p className="text-[11px] text-stone-400">Authentic Generational Loom Craft</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1410] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tracked Consignments</h4>
              <p className="text-[11px] text-stone-400">Realtime 5-Stage Status Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1410] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bespoke T-Shirt Studio</h4>
              <p className="text-[11px] text-stone-400">Custom Screen Printing · Min 10</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1410] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">A.C. Raj Kumar</h4>
              <p className="text-[11px] text-stone-400">Master Artisan & Founder</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1410] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-lg">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                  ACR COTTONS
                </span>
                <span className="text-[9px] uppercase tracking-[0.24em] text-[#C4A35A] font-bold">
                  SURAMPATTI VALASU · ERODE
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Operating out of Erode, Tamil Nadu, ACR Cottons crafts royal boutique-hotel bedding, jacquard pillows, and customized screen-printed cotton apparel.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +91 87788 24123</span>
              </a>

              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Gmail Concierge: contact@acrprints.com</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation & Services */}
          <div>
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">
              Atelier Portals
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/dashboard" className="text-[#D4AF37] hover:underline font-bold transition-colors">
                  ✦ Atelier Dashboard (My Orders & Profile)
                </Link>
              </li>
              <li>
                <Link to="/custom-studio" className="hover:text-amber-300 font-semibold transition-colors">
                  ✦ Customized T-Shirt Studio (Min 10 Orders)
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-amber-300 transition-colors">
                  ✦ Live Order & Consignment Tracking
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-300 transition-colors">
                  All Bedding & Pillowcases
                </Link>
              </li>
              <li>
                <Link to="/location" className="hover:text-amber-300 transition-colors">
                  Store Location & Google Maps
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Contact Master Weaver
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Founder Heritage */}
          <div>
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">
              Founder Philosophy
            </h3>
            <div className="text-xs space-y-2.5 text-stone-400 leading-relaxed">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/owner.jpeg"
                  alt="A.C. Raj Kumar"
                  className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                />
                <div>
                  <span className="font-bold text-white block">A.C. RAJ KUMAR</span>
                  <span className="text-[10px] text-[#C4A35A]">Founder, ACR COTTONS</span>
                </div>
              </div>
              <p className="italic text-stone-300">
                "From Thread to Treasure — crafting designs to make evolution in the textile industry."
              </p>
              <p>
                Operating out of Erode, Tamil Nadu (known as the "Textile Valley of South India"), bringing boutique hotel serenity into every residence.
              </p>
            </div>
          </div>

          {/* Col 4: Store Visit & Contact */}
          <div className="space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">
              Flagship Atelier
            </h3>

            <div className="flex items-start gap-2.5 text-stone-300">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong>ACR COTTONS Showroom</strong>,<br />
                2, Sathya Moorthy Street, Surampatti Valasu,<br />
                Erode, Tamil Nadu - 638009, India.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-stone-300">
              <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong>Timings:</strong> 8:00 AM – 8:00 PM<br />
                All working days (Closed Sat & Sun).
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-stone-300">
              <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                <strong>Company No:</strong>{' '}
                <a href="tel:+918778824123" className="font-mono text-white hover:underline">
                  +91 87788 24123
                </a>
              </span>
            </div>

            <div className="pt-2">
              <a
                href={shop.mapUrl || 'https://maps.app.goo.gl/48x6D8xnWNCibc9YA'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline font-semibold"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-stone-800/80 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} ACR COTTONS (Surampatti Valasu, Erode). All rights reserved.
          </p>
          <p className="text-[11px] text-stone-400">
            Handcrafted with Artisanal Purity in Erode, Tamil Nadu
          </p>
        </div>
      </div>
    </footer>
  );
}
