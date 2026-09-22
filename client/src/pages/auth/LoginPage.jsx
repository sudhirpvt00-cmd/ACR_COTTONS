import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Copy,
  ArrowRight,
  Clock,
  RotateCcw,
  Crown,
  CheckCircle2,
  Feather,
} from 'lucide-react';
import Input from '../../components/common/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validators } from '../../utils/validators.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendLoginOtp, verifyLoginOtp } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [generatedDevOtp, setGeneratedDevOtp] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let timer;
    if (otpSent && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, timerSeconds]);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: null }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!mobile) newErrors.mobile = 'Mobile number is required';
    if (!validators.isValidMobile(mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await login({ mobile, password });

      if (res.requiresFirstLoginOtp) {
        setIsFirstLogin(true);
        setOtpSent(true);
        setGeneratedDevOtp(res.devOtp || '582910');
        setTimerSeconds(60);
        setCanResend(false);
        showInfo('First-time login detected! Security OTP sent.');
        return;
      }

      showSuccess(res.message || 'Welcome to ACR Cottons!');
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.message || 'Invalid credentials.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await sendLoginOtp({ mobile });
      setGeneratedDevOtp(res.devOtp || '492810');
      setTimerSeconds(res.resendWaitSeconds || 60);
      setCanResend(false);
      showSuccess('OTP resent successfully');
    } catch (err) {
      showError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP' });
      return;
    }

    try {
      setLoading(true);
      const res = await verifyLoginOtp({ mobile, otp: otpValue });
      showSuccess(res.message || 'Authenticated successfully! Entering ACR Cottons.');
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const fillCustomerAccount = () => {
    setMobile('9876501234');
    setPassword('Customer@12345');
    setErrors({});
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0E0B09] text-stone-100 relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#916C23]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* LEFT SIDE: Unified Luxury Form Container */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-16 relative z-10">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 lg:hidden mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#1A1410] flex items-center justify-center border border-[#D4AF37]/50 shadow-md">
            <Crown className="w-5 h-5 text-[#E5C158]" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-white tracking-wider block">
              ACR COTTONS
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase">
              Customer Atelier
            </span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto bg-[#17120E]/85 backdrop-blur-xl border border-[#D4AF37]/30 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#E5C158] inline-block mb-1.5">
             
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {otpSent ? 'Security Verification' : 'Customer Sign In'}
            </h1>
            <p className="text-stone-400 text-sm mt-2 font-serif italic">
              {otpSent
                ? `Enter the 6-digit authentication key dispatched to +91 ${mobile}`
                : 'Access your luxury bedding orders, tracking, and custom weaves.'}
            </p>
          </div>

          {/* OTP Flow */}
          {otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
              {isFirstLogin && (
                <div className="p-3.5 bg-[#2A1F13] border border-[#D4AF37]/40 rounded-2xl flex items-center gap-3 text-xs text-[#F2DFAC]">
                  <Sparkles className="w-4 h-4 text-[#E5C158] shrink-0" />
                  <span>First-time access: Verify your mobile number with OTP.</span>
                </div>
              )}

              {generatedDevOtp && (
                <div className="p-4 bg-[#231A13] rounded-2xl border border-[#D4AF37]/40 shadow-inner">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#E5C158] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Dev Verification OTP
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpValue(generatedDevOtp)}
                      className="text-[10px] font-bold px-2.5 py-0.5 bg-[#D4AF37] text-stone-950 rounded-full hover:bg-white transition-colors"
                    >
                      Autofill
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold tracking-[0.3em] text-white">
                      {generatedDevOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedDevOtp);
                        showSuccess('Copied OTP to clipboard');
                      }}
                      className="text-stone-400 hover:text-white p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  6-Digit Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                  }}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.35em] font-mono text-2xl font-bold py-3.5 bg-[#1C1510] border border-[#3E2E20] focus:border-[#E5C158] rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E5C158]/30 text-white transition-all placeholder:text-stone-600"
                  autoFocus
                />
                {errors.otp && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || otpValue.length !== 6}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E3A2] to-[#D4AF37] text-[#120E0A] hover:brightness-105 font-serif font-bold text-sm tracking-widest uppercase shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#120E0A] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-2 font-serif">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpValue('');
                  }}
                  className="hover:text-stone-200 underline"
                >
                  Edit phone number
                </button>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-bold text-[#E5C158] hover:underline flex items-center gap-1 font-sans"
                  >
                    <RotateCcw className="w-3 h-3" /> Resend OTP
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-stone-500 font-sans text-[11px]">
                    <Clock className="w-3 h-3" /> Resend in {timerSeconds}s
                  </span>
                )}
              </div>
            </form>
          ) : (
            /* Customer Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={handleMobileChange}
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 bg-[#1F1712] border border-[#3E2E20] focus:border-[#E5C158] rounded-2xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E5C158]/20 transition-all text-sm"
                    required
                  />
                </div>
                {errors.mobile && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.mobile}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-stone-300"
                  >
                    PASSWORD
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-serif italic text-[#E5C158] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your confidential password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    className="w-full pl-10 pr-10 py-3 bg-[#1F1712] border border-[#3E2E20] focus:border-[#E5C158] rounded-2xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E5C158]/20 transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.password}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E8D08D] to-[#D4AF37] text-[#120E0A] hover:brightness-110 font-serif font-bold text-sm tracking-[0.2em] uppercase shadow-lg shadow-black/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#120E0A] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Customer</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-400 font-serif">
                  New customer?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-[#E5C158] hover:underline font-sans ml-1"
                  >
                    Create Account (with OTP Verification)
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Customer Demo Account One-Click */}
          <div className="mt-8 pt-5 border-t border-stone-800">
            <button
              type="button"
              onClick={fillCustomerAccount}
              className="w-full p-3 rounded-2xl bg-[#1F1712] border border-[#3E2E20] hover:border-[#D4AF37]/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <span className="block font-bold text-stone-200 group-hover:text-[#E5C158] text-xs">
                    Quick Demo: Sudhir Karvannan
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">9876501234 (Verified Patron)</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] group-hover:underline">
                Fill & Test
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-stone-500 text-[11px] text-center lg:text-left font-serif pt-6">
          © {new Date().getFullYear()} ACR Cottons Atelier. Handcrafted Luxury Bedding & Textiles.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: Matching Dark Luxury Showcase */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex w-1/2 relative p-16 flex-col justify-between overflow-hidden border-l border-[#D4AF37]/20">
        {/* Heritage Tagline */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E5C158] animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#E5C158] font-bold">
              Erode Handloom Heritage
            </span>
          </div>
          <span className="text-xs text-stone-400 font-serif italic tracking-wide">
            Est. Authentic Weaves
          </span>
        </div>

        {/* Center Crest & Luxury Identity */}
        <div className="relative z-10 max-w-lg mx-auto text-center space-y-7">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-b from-[#2B1F16] to-[#15100B] border border-[#D4AF37]/50 flex items-center justify-center shadow-2xl relative z-10">
              <Crown className="w-12 h-12 text-[#E5C158] drop-shadow-[0_4px_12px_rgba(229,193,88,0.4)]" />
            </div>
            <div className="absolute inset-0 bg-[#E5C158]/20 blur-xl rounded-full -z-1" />
          </div>

          <div>
            <h2 className="font-serif text-4xl xl:text-5xl font-extrabold tracking-wide text-white">
              ACR COTTONS
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <p className="font-serif tracking-[0.35em] uppercase text-xs text-[#E5C158]">
                Royal Atelier & Handloom Hub · Erode
              </p>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
          </div>

          <p className="text-stone-300 text-sm leading-relaxed max-w-md mx-auto font-light font-serif">
            Immerse yourself in heirloom-grade 600-thread count combed cotton, artisanal precision weaves, and bespoke bedding custom tailored for discerning homes.
          </p>

          {/* Pillars */}
          <div className="pt-2 grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-[#17120E]/80 border border-[#D4AF37]/20 backdrop-blur-md">
              <Feather className="w-4 h-4 text-[#E5C158] mx-auto mb-1.5" />
              <span className="block text-[11px] font-bold text-stone-200">100% Combed</span>
              <span className="text-[10px] text-stone-400">Pure Long-Staple</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#17120E]/80 border border-[#D4AF37]/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#E5C158] mx-auto mb-1.5" />
              <span className="block text-[11px] font-bold text-stone-200">Zero Synthetic</span>
              <span className="text-[10px] text-stone-400">Breathable Satin</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#17120E]/80 border border-[#D4AF37]/20 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-[#E5C158] mx-auto mb-1.5" />
              <span className="block text-[11px] font-bold text-stone-200">Certified Guild</span>
              <span className="text-[10px] text-stone-400">Erode Master Crafts</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 text-xs text-stone-400 border-t border-[#D4AF37]/20 pt-4 flex items-center justify-between font-serif">
          <span>Customer Atelier Storefront</span>
          <span className="text-[#E5C158] tracking-widest text-[11px] font-sans font-medium uppercase">
            Encrypted Client Portal
          </span>
        </div>
      </div>
    </div>
  );
}