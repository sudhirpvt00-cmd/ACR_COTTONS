import React, { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, Clock, MapPin, Headphones } from 'lucide-react';
import StoreLayout from '../../components/storefront/StoreLayout.jsx';
import { shopApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ContactPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    subject: 'Product enquiry',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await shopApi.sendContact(form);
      if (res.success) {
        showSuccess(res.message);
        setForm((prev) => ({ ...prev, message: '' }));
      }
    } catch (err) {
      showError(err.message || 'Could not send your message.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StoreLayout>
      <section className="relative overflow-hidden border-b border-gold-200/50">
        <div className="absolute inset-0 bg-espresso" />
        <div className="absolute inset-0 opacity-40 bg-[url('/images/products/pillow_cover_1.jpeg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/85 to-espresso/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold-300 font-semibold">Concierge</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ivory mt-3">Contact Support</h1>
          <p className="mt-4 max-w-xl text-ivory/75 text-sm leading-relaxed">
            Speak with the ACR Prints atelier for custom bedding, bulk orders, store visits, and after-sales care.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-5 gap-10">
        <aside className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl border border-[#E8D5A3] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/images/owner.jpeg"
                alt="A.C. Raj Kumar"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-none">A.C. Raj Kumar</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6E2C]">Founder & Master Weaver</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Founded in Erode, Tamil Nadu — the Textile Valley of South India — ACR COTTONS specializes in artisanal bedding, jacquard pillows, and custom t-shirt printing.
            </p>
          </div>

          <div className="rounded-3xl border border-gold-200/80 bg-espresso text-ivory p-6 space-y-4">
            <div className="flex gap-3">
              <Phone className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300">Company Telephone</p>
                <a href="tel:+918778824123" className="text-sm font-mono">+91 87788 24123</a>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300">Official Gmail</p>
                <a href="mailto:contact@acrprints.com" className="text-sm">contact@acrprints.com</a>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300">Flagship Atelier</p>
                <p className="text-xs">2, Sathya Moorthy Street, Surampatti Valasu, Erode 638009</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300">Working Hours</p>
                <p className="text-xs">Mon – Fri, 8:00 AM – 8:00 PM · Closed Sat & Sun</p>
              </div>
            </div>

            {/* Instant WhatsApp and Gmail Buttons */}
            <div className="pt-2 space-y-2 border-t border-stone-800">
              <a
                href="https://wa.me/918778824123?text=Hello%20ACR%20Cottons%20Team%2C%20I%20would%20like%20assistance%20regarding%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Chat Directly on WhatsApp</span>
              </a>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@acrprints.com&su=Assistance%20Inquiry%20-%20ACR%20Cottons"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-stone-700"
              >
                <span>Write via Gmail Web</span>
              </a>
            </div>
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 rounded-3xl border border-gold-200/80 bg-white/80 p-6 sm:p-8 shadow-card space-y-4"
        >
          <h2 className="font-serif text-2xl text-espresso">Write to us</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Full name</span>
              <div className="relative mt-1.5">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-ivory/50 text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Email</span>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-ivory/50 text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Mobile</span>
              <div className="relative mt-1.5">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-ivory/50 text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Subject</span>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1.5 w-full px-3 py-3 rounded-xl border border-stone-200 bg-ivory/50 text-sm focus:border-gold-500 focus:outline-none"
              >
                <option>Product enquiry</option>
                <option>Custom order / bulk</option>
                <option>Order support</option>
                <option>Store visit</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Message</span>
            <div className="relative mt-1.5">
              <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about the bedding, sizes, or visit you have in mind..."
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-ivory/50 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-espresso text-ivory text-sm font-semibold border border-gold-400/40 hover:bg-maroon-800 transition-colors"
          >
            <Send className="w-4 h-4 text-gold-400" />
            {saving ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </StoreLayout>
  );
}
