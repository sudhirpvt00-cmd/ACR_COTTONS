import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import StepProgress from '../../components/auth/StepProgress.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';
import DevOtpBanner from '../../components/common/DevOtpBanner.jsx';
import { authApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validators } from '../../utils/validators.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const from = '/dashboard';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else if (name === 'otp') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // -------------------------------------------------------------
  // Step 1: Validate Details and Send OTP
  // -------------------------------------------------------------
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validators.isValidMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!validators.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    try {
      setLoading(true);
      const res = await authApi.sendRegisterOtp({
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.trim(),
      });

      showSuccess(res.message || 'Verification OTP sent to your mobile number!');
      setDevOtp(res.devOtp || null);
      setResendTimer(res.resendWaitSeconds || 30);
      setStep(2);
    } catch (err) {
      showError(err.message || 'Failed to send OTP.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 2: Verify OTP
  // -------------------------------------------------------------
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    try {
      setResendLoading(true);
      const res = await authApi.sendRegisterOtp({
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.trim(),
      });
      showSuccess('A fresh OTP has been sent!');
      setDevOtp(res.devOtp || null);
      setResendTimer(res.resendWaitSeconds || 30);
    } catch (err) {
      showError(err.message || 'Unable to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'Please enter the 6-digit OTP';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      setLoading(true);
      const res = await authApi.verifyRegisterOtp({
        mobile: formData.mobile,
        otp: formData.otp,
        purpose: 'REGISTER',
      });

      showSuccess(res.message || 'OTP verified successfully!');
      setStep(3);
    } catch (err) {
      showError(err.message || 'Invalid OTP code.');
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 3: Password creation & finalize registration
  // -------------------------------------------------------------
  const validateStep3 = () => {
    const newErrors = {};
    const { score } = validators.checkPasswordStrength(formData.password);

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (score < 60) {
      newErrors.password = 'Please provide a stronger password meeting the criteria';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    try {
      setLoading(true);
      const res = await authApi.completeRegistration({
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.user) {
        setUser(res.user);
      }

      showSuccess('Account created successfully! Welcome to ACR Cottons.');
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? 'Create Your Account'
          : step === 2
          ? 'Verify Mobile Number'
          : 'Set Your Password'
      }
      subtitle={
        step === 1
          ? 'Join ACR Cottons for luxury artisanal textiles & custom print orders'
          : step === 2
          ? `We sent a 6-digit OTP to +91 ${formData.mobile}`
          : 'Create a secure password to protect your account'
      }
    >
      <StepProgress currentStep={step} />

      {/* STEP 1: Personal Details */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4" noValidate>
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              label="FULL NAME"
              placeholder="e.g. Priya Sharma"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              error={errors.name}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              label="MOBILE NUMBER"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              icon={Phone}
              error={errors.mobile}
              autoComplete="tel"
              maxLength={10}
              required
            />
          </div>

          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label="EMAIL ADDRESS"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              error={errors.email}
              autoComplete="email"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              showArrow={true}
            >
              Send Verification OTP
            </Button>
          </div>

          <div className="text-center pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-orange-700 hover:text-orange-800 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      )}

      {/* STEP 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4" noValidate>
          {/* Dev OTP quick autofill banner */}
          <DevOtpBanner
            otp={devOtp}
            onAutoFill={(code) => setFormData((prev) => ({ ...prev, otp: code }))}
          />

          <div>
            <Input
              id="otp"
              name="otp"
              type="text"
              label="ENTER 6-DIGIT OTP"
              placeholder="• • • • • •"
              value={formData.otp}
              onChange={handleChange}
              icon={ShieldCheck}
              error={errors.otp}
              maxLength={6}
              className="text-center tracking-widest text-lg font-mono font-bold"
              autoFocus
              required
            />
          </div>

          {/* Resend and change number controls */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>

            <div>
              {resendTimer > 0 ? (
                <span className="text-stone-400 font-medium">
                  Resend in <strong className="text-stone-700 font-mono">{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-orange-700 hover:text-orange-800 font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              showArrow={true}
            >
              Verify & Proceed
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Password Creation */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit} className="space-y-4" noValidate>
          <div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="CREATE PASSWORD"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              error={errors.password}
              autoComplete="new-password"
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
            <PasswordStrengthMeter password={formData.password} />
          </div>

          <div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="CONFIRM PASSWORD"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-stone-400 hover:text-stone-600 focus:outline-none p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              showArrow={true}
            >
              Complete Registration
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
