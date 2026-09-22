import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  Crown,
  MessageCircle,
  Mail,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';

const MAP_URL = 'https://maps.app.goo.gl/48x6D8xnWNCibc9YA';
const EMBED_SRC = 'https://maps.google.com/maps?q=11.3257665,77.7012776&z=17&output=embed';

export default function LocationPage() {
  return (
    <StoreLayout>
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-gold-200/50 bg-gradient-to-b from-[#1A1410] via-[#241A14] to-[#1A1410] text-[#FAF7F2]">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-[11px] uppercase tracking-[0.3em] font-bold mb-3 border border-[#D4AF37]/30">
            <Crown className="w-3.5 h-3.5" />
            Erode Flagship Atelier
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-white font-bold mt-1">
            Store Location & Founder
          </h1>
          <p className="mt-3 max-w-2xl text-stone-300 text-sm sm:text-base leading-relaxed">
            ACR COTTONS welcomes patrons to our private showroom and manufacturing atelier in Surampatti Valasu, Erode — the Textile Valley of South India.
          </p>
        </div>
      </section>

      {/* Main Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Founder & Store Info 2-Col */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Founder Picture & Info (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8D5A3] p-6 sm:p-8 shadow-card flex flex-col items-center text-center">
            <div className="relative p-2 rounded-3xl bg-gradient-to-tr from-[#1A1410] via-[#C4A35A] to-[#1A1410] shadow-xl mb-4">
              <img
                src="/images/owner.jpeg"
                alt="A.C. Raj Kumar - Founder of ACR Cottons"
                className="w-56 h-64 sm:w-64 sm:h-72 object-cover object-top rounded-2xl shadow-md"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1A1410] text-[#D4AF37] border border-[#D4AF37] rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-md">
                Founder & Visionary
              </div>
            </div>

            <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
              A.C. RAJ KUMAR
            </h3>
            <p className="text-xs uppercase font-semibold tracking-[0.2em] text-[#8C6E2C] mb-4">
              Founder, ACR COTTONS
            </p>

            <p className="text-xs text-stone-600 leading-relaxed text-left">
              The visionary behind ACR Cottons is dedicated to redefining home comfort through artisanal excellence. Dedicated to the principle of "From Thread to Treasure," our collections bring a royal, serene feel to every home.
            </p>
          </div>

          {/* Store Location & Hours (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-[#E8D5A3] bg-white p-7 sm:p-8 shadow-card space-y-5">
              <div className="flex items-center gap-2 text-[#8C6E2C]">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] uppercase tracking-[0.28em] font-bold">
                  Flagship Showroom
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                ACR COTTONS Showroom
              </h2>

              <div className="space-y-3 pt-2 text-sm text-stone-700">
                <p className="flex gap-3 leading-relaxed">
                  <MapPin className="w-5 h-5 text-[#8A182B] shrink-0 mt-0.5" />
                  <span>
                    <strong>Address:</strong> 2, Sathya Moorthy Street, Surampatti Valasu, Erode, Tamil Nadu 638009, India.
                  </span>
                </p>
                <p className="flex gap-3 leading-relaxed">
                  <Clock className="w-5 h-5 text-[#8A182B] shrink-0 mt-0.5" />
                  <span>
                    <strong>Store Timings:</strong> 8:00 AM – 8:00 PM, all working days except Saturday and Sunday.
                  </span>
                </p>
                <p className="flex gap-3 leading-relaxed">
                  <Phone className="w-5 h-5 text-[#8A182B] shrink-0 mt-0.5" />
                  <span>
                    <strong>Company Number:</strong>{' '}
                    <a href="tel:+918778824123" className="font-bold text-stone-900 hover:underline">
                      +91 87788 24123
                    </a>{' '}
                    (8778824123)
                  </span>
                </p>
              </div>

              {/* Action Buttons: Google Maps, WhatsApp, Gmail */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3">
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1410] text-[#D4AF37] hover:text-white border border-[#D4AF37] text-xs font-bold shadow-md transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://wa.me/918778824123?text=Hello%20ACR%20Cottons%2C%20I%20would%20like%20directions%20or%20store%20information."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (+91 87788 24123)</span>
                </a>

                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=Visiting%20ACR%20Cottons%20Store%20Erode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition-colors"
                >
                  <Mail className="w-4 h-4 text-rose-600" />
                  <span>Gmail Concierge</span>
                </a>
              </div>
            </div>

            {/* In-Store Offerings & Customized T-Shirt Printing */}
            <div className="rounded-3xl bg-gradient-to-br from-[#1A1410] to-[#2E1E16] text-white p-7 sm:p-8 space-y-3 border border-[#D4AF37]/30 shadow-card">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-serif text-xl font-bold">Customized T-Shirt Printing In Store</h3>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Customized cotton t-shirt printing is available on-site at our workshop. You can bring your design or review live proof mockups on our virtual visualizer. Minimum order limitation of <strong>10 shirts</strong> applies for screen and digital production.
              </p>
              <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside pt-1">
                <li>180 GSM & 220 GSM Bio-Washed Combed Cotton</li>
                <li>Single and multi-color vector screen printing</li>
                <li>Dedicated tracking number provided for every dispatch</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Google Map */}
        <div className="rounded-3xl overflow-hidden border border-[#E8D5A3] shadow-elevated min-h-[440px] bg-stone-100">
          <iframe
            title="ACR COTTONS Google Map Location"
            src={EMBED_SRC}
            className="w-full h-full min-h-[440px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </StoreLayout>
  );
}
