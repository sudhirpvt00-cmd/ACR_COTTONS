import React from 'react';
import { Sparkles, ShieldCheck, Truck, Award, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D4AF37]/30 selection:text-[#1A1410]">
      {/* Subtle royal background atmosphere */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#9B1B30]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C4A35A_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1410] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-xl group-hover:scale-105 transition-transform mb-2">
              <Crown className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1410]">
              ACR COTTONS
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-px w-6 bg-[#C4A35A]" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C6E2C]">
                Royal Atelier & Handloom Hub · Erode
              </span>
              <span className="h-px w-6 bg-[#C4A35A]" />
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E8D5A3]/70 shadow-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          {/* Top royal gold accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8C6E2C] via-[#D4AF37] to-[#8C6E2C]" />

          {title && (
            <div className="mb-6 text-center">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1410]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-4 border-t border-stone-300/60 flex items-center justify-around text-stone-600 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#C4A35A]" />
            <span>Artisanal Heritage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#C4A35A]" />
            <span>Tracked Express Cargo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C4A35A]" />
            <span>100% Cotton Purity</span>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 text-center text-xs text-stone-500 mt-6">
        &copy; {new Date().getFullYear()} ACR COTTONS (Surampatti Valasu, Erode). All rights reserved.
      </div>
    </div>
  );
}
