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
  CheckCircle2,
  Copy,
  ArrowRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validators } from '../../utils/validators.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendLoginOtp, verifyLoginOtp } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Login Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState('otp');

  // Form states
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP Step states
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [generatedDevOtp, setGeneratedDevOtp] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Timer countdown for OTP resend
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

  // 1. Request Realtime OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!mobile) {
      setErrors({ mobile: 'Please enter your 10-digit mobile number' });
      return;
    }
    if (!validators.isValidMobile(mobile)) {
      setErrors({ mobile: 'Enter a valid 10-digit mobile number starting with 6-9' });
      return;
    }

    try {
      setLoading(true);
      const res = await sendLoginOtp({ mobile });
      setOtpSent(true);
      setIsFirstLogin(res.isFirstLogin ?? true);
      setGeneratedDevOtp(res.devOtp || '492810');
      setTimerSeconds(res.resendWaitSeconds || 60);
      setCanResend(false);
      showSuccess(res.message || `Realtime OTP generated for +91 ${mobile}`);
    } catch (err) {
      showError(err.message || 'Failed to send OTP. Please check your mobile number.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Realtime OTP & Log In
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
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
      showError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Login (with First-Time Login OTP Detection)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!mobile) newErrors.mobile = 'Mobile number is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await login({ mobile, password });

      // If user's first time logging in, server triggers realtime OTP requirement!
      if (res.requiresFirstLoginOtp) {
        setIsFirstLogin(true);
        setOtpSent(true);
        setLoginMode('otp');
        setGeneratedDevOtp(res.devOtp || '582910');
        setTimerSeconds(60);
        setCanResend(false);
        showInfo('First-time login detected! Security OTP generated in realtime.');
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

  // Autofill code helper
  const handleAutofillCode = () => {
    if (generatedDevOtp) {
      setOtpValue(generatedDevOtp);
      showInfo(`Autofilled realtime OTP: ${generatedDevOtp}`);
    }
  };

  // One-click demo filler
  const fillDemoAccount = (demMobile, demPass) => {
    setMobile(demMobile);
    setPassword(demPass);
    setErrors({});
  };

  return (
    <AuthLayout
      title={otpSent ? 'Verify Realtime OTP' : 'Sign In to ACR Cottons'}
      subtitle={
        otpSent
          ? `Enter the 6-digit royal verification code sent to +91 ${mobile}`
          : 'Access your luxury bedding dashboard, custom orders & tracking'
      }
    >
      {/* Mode Switcher Tabs (when OTP not yet active) */}
      {!otpSent && (
        <div className="flex rounded-2xl bg-stone-100 p-1.5 mb-6 border border-stone-200/80">
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'otp'
                ? 'bg-white text-[#1A1410] shadow-sm border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${loginMode === 'otp' ? 'text-[#D4AF37]' : ''}`} />
            <span>Realtime OTP (First-Time / Fast)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'password'
                ? 'bg-white text-[#1A1410] shadow-sm border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE A: OTP Verification Form (Active once OTP is requested) */}
      {/* ========================================================================= */}
      {otpSent ? (
        <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
          {/* First Time Login Badge */}
          {isFirstLogin && (
            <div className="p-3 bg-amber-50 border border-[#D4AF37]/50 rounded-2xl flex items-center gap-2.5 text-xs text-amber-950">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                <strong>First-time sign in detected:</strong> A realtime one-time password has been generated to verify your account.
              </span>
            </div>
          )}

          {/* Realtime Generated OTP Banner */}
          {generatedDevOtp && (
            <div className="p-4 bg-gradient-to-br from-[#1A1410] to-[#2B1D16] rounded-2xl text-white border border-[#D4AF37]/40 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Realtime OTP Generated</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillCode}
                  className="px-2.5 py-1 text-[10px] font-bold bg-[#D4AF37] text-[#1A1410] rounded-lg hover:bg-white transition-colors"
                >
                  Autofill Code
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-extrabold tracking-[0.3em] text-white">
                  {generatedDevOtp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDevOtp);
                    showSuccess('OTP copied to clipboard');
                  }}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
                  title="Copy OTP"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-stone-300 mt-2">
                Simulated SMS delivery for instant first-time verification.
              </p>
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-600 mb-1.5">
              ENTER 6-DIGIT OTP
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="• • • • • •"
              value={otpValue}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpValue(clean);
                if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
              }}
              className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 px-4 bg-stone-50 border border-stone-200 focus:border-[#D4AF37] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-stone-900"
              autoFocus
            />
            {errors.otp && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.otp}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              disabled={loading || otpValue.length !== 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1A1410] via-[#2D1F17] to-[#1A1410] border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white hover:border-[#D4AF37] font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpValue('');
                }}
                className="hover:text-stone-800 underline font-medium"
              >
                Change mobile number
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="font-bold text-[#8C6E2C] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>Resend in {timerSeconds}s</span>
                </span>
              )}
            </div>
          </div>
        </form>
      ) : loginMode === 'otp' ? (
        /* ========================================================================= */
        /* CASE B: Request Realtime OTP (Step 1 of OTP login) */
        /* ========================================================================= */
        <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
          <div>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              label="MOBILE NUMBER"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={handleMobileChange}
              icon={Phone}
              error={errors.mobile}
              autoComplete="tel"
              maxLength={10}
              required
            />
            <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Generates instant realtime OTP for first-time or returning users.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || mobile.length < 10}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1A1410] via-[#2D1F17] to-[#1A1410] border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Generate Realtime OTP</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* ========================================================================= */
        /* CASE C: Standard Password Login */
        /* ========================================================================= */
        <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
          <div>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              label="MOBILE NUMBER"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={handleMobileChange}
              icon={Phone}
              error={errors.mobile}
              autoComplete="tel"
              maxLength={10}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold tracking-wider uppercase text-stone-600"
              >
                PASSWORD
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#8C6E2C] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              icon={Lock}
              error={errors.password}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600 focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1A1410] via-[#2D1F17] to-[#1A1410] border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Register Link */}
      <div className="text-center pt-4 border-t border-stone-100 mt-4">
        <p className="text-xs text-stone-600">
          New to ACR Cottons?{' '}
          <Link
            to="/register"
            className="font-bold text-[#8C6E2C] hover:underline inline-flex items-center gap-1"
          >
            <span>Register & Create Account</span>
          </Link>
        </p>
      </div>

      {/* Quick Demo Fillers */}
      <div className="mt-5 p-3.5 bg-[#FAF7F2] border border-[#E8D5A3] rounded-2xl text-[11px] text-stone-600">
        <span className="font-bold text-[#1A1410] block mb-1.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C4A35A]" />
          <span>Quick Demo Access (Pre-Seeded)</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('9876501234', 'Customer@12345')}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-[#D4AF37] text-left transition-all group"
          >
            <span className="block font-bold text-stone-900 group-hover:text-[#8C6E2C]">Priya Sharma (Customer)</span>
            <span className="text-[10px] text-stone-500 font-mono">9876501234</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('9876543210', 'Admin@12345')}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-[#D4AF37] text-left transition-all group"
          >
            <span className="block font-bold text-stone-900 group-hover:text-[#8C6E2C]">ACR Admin</span>
            <span className="text-[10px] text-stone-500 font-mono">9876543210</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
