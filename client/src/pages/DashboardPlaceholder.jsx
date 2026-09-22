import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Sparkles,
  LogOut,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Layers,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPlaceholder() {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showSuccess('You have been signed out successfully.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-100" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-amber-950">
                Dhanu Textile
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 rounded-full">
                Phase 1 Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-stone-900">{user?.name}</span>
              <span className="text-[11px] text-stone-500">+91 {user?.mobile}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-rose-700 bg-stone-100 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-900 via-amber-900 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-elevated relative overflow-hidden mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phase 1 Authentication Flow Live</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
              Namaste, {user?.name}!
            </h1>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed mb-6">
              You are securely signed in via HTTP-only JWT cookies and password hashing.
              Your account is active and ready to explore Dhanu Textile's handcrafted weaves in Phase 2.
            </p>
          </div>

          {/* Background art circles */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-20 -bottom-20 w-60 h-60 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Profile Card & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Details Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-card">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>Active Customer Profile</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Full Name
                </span>
                <span className="text-sm font-semibold text-stone-900">{user?.name}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Mobile Number
                </span>
                <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  +91 {user?.mobile}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Email Address
                </span>
                <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {user?.email}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Account Role & Security
                </span>
                <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {user?.role} (Encrypted via bcrypt)
                </span>
              </div>
            </div>
          </div>

          {/* Phase 2 Teaser Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/60 p-6 flex flex-col justify-between shadow-soft">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-950 mb-2">
                Phase 2: Storefront
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ready to be built upon your confirmation: Hero banner, Kanchipuram Silk & Cotton categories, live search, filters, product detail zoom & cart.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                Database Status
              </span>
              <span className="text-xs text-stone-600">
                🌱 5 demo products & 4 categories seeded and ready!
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
