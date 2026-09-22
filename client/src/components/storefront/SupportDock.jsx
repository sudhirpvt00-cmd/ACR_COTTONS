import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Phone,
  MapPin,
  Headphones,
  Mail,
  Truck,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/918778824123?text=' +
  encodeURIComponent('Hello ACR Cottons, I would like assistance with luxury bedding, custom t-shirt printing, or my order.');

const GMAIL_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=' +
  encodeURIComponent('Customer Support Inquiry - ACR Cottons') +
  '&body=' +
  encodeURIComponent('Hello ACR Cottons Team,\n\nI need assistance regarding:\n');

export default function SupportDock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 font-sans">
      {open && (
        <div className="w-80 rounded-3xl border border-[#E8D5A3] bg-white/95 shadow-2xl backdrop-blur-md overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-5 py-4 bg-[#1A1410] text-[#FAF7F2] border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ACR COTTONS CONCIERGE</span>
            </div>
            <p className="font-serif text-lg font-bold text-white mt-0.5 leading-tight">
              Artisan Support & Assistance
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Erode, Tamil Nadu · Mon–Fri 8AM–8PM
            </p>
          </div>

          {/* Action Links */}
          <div className="p-2.5 space-y-1">
            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="block">WhatsApp Direct Chat</span>
                <span className="text-[10px] font-normal text-stone-500">+91 87788 24123</span>
              </div>
            </a>

            {/* Gmail */}
            <a
              href={GMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-rose-50 hover:text-rose-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block">Assistance via Gmail</span>
                <span className="text-[10px] font-normal text-stone-500">contact@acrprints.com</span>
              </div>
            </a>

            {/* Telephone */}
            <a
              href="tel:+918778824123"
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-amber-50 hover:text-amber-900 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block">Call Master Weaver</span>
                <span className="text-[10px] font-normal text-stone-500 font-mono">8778824123</span>
              </div>
            </a>

            {/* Custom T-Shirt Studio */}
            <Link
              to="/custom-studio"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-purple-50 hover:text-purple-900 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="block">Custom T-Shirt Studio</span>
                <span className="text-[10px] font-normal text-stone-500">Live 3D preview · Min 10</span>
              </div>
            </Link>

            {/* Track Order */}
            <Link
              to="/track-order"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="block">Live Order Tracking</span>
                <span className="text-[10px] font-normal text-stone-500">5-step consignment timeline</span>
              </div>
            </Link>

            {/* Store Location */}
            <Link
              to="/location"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block">Store Location & Maps</span>
                <span className="text-[10px] font-normal text-stone-500">Surampatti Valasu, Erode</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Concierge Action Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-[#1A1410] text-[#D4AF37] shadow-2xl border-2 border-[#D4AF37] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
        aria-label={open ? 'Close support' : 'Open support'}
      >
        {open ? <X className="w-5 h-5" /> : <Headphones className="w-6 h-6" />}
      </button>
    </div>
  );
}
