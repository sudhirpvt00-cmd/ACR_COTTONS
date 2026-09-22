import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';
import DevOtpBanner from '../../components/common/DevOtpBanner.jsx';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validators } from '../../utils/validators.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    mobile: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

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

  // Step 1: Send OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!formData.mobile || !validators.isValidMobile(formData.mobile)) {
      setErrors({ mobile: 'Please enter a valid 10-digit registered mobile number' });
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.sendForgotOtp({ mobile: formData.mobile });
      showSuccess(res.message || 'Password reset OTP sent!');
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

  // Step 2: Verify OTP
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP' });
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verifyForgotOtp({
        mobile: formData.mobile,
        otp: formData.otp,
        purpose: 'FORGOT_PASSWORD',
      });
      showSuccess(res.message || 'OTP verified!');
      setStep(3);
    } catch (err) {
      showError(err.message || 'Invalid OTP');
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    try {
      setResendLoading(true);
      const res = await authApi.sendForgotOtp({ mobile: formData.mobile });
      showSuccess('A fresh reset code was sent!');
      setDevOtp(res.devOtp || null);
      setResendTimer(res.resendWaitSeconds || 30);
    } catch (err) {
      showError(err.message || 'Could not resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 3: Reset password
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const { score } = validators.checkPasswordStrength(formData.newPassword);

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (score < 60) {
      newErrors.newPassword = 'Password is not strong enough';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.resetPassword({
        mobile: formData.mobile,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      showSuccess(res.message || 'Password reset successful! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      showError(err.message || 'Failed to reset password');
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? 'Reset Password'
          : step === 2
          ? 'Verify Identity'
          : 'Choose New Password'
      }
      subtitle={
        step === 1
          ? 'Enter your registered mobile number to receive a recovery code'
          : step === 2
          ? `Enter the 6-digit code sent to +91 ${formData.mobile}`
          : 'Enter your new secure password below'
      }
    >
      {/* STEP 1: Enter mobile number */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4" noValidate>
          <div>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              label="REGISTERED MOBILE NUMBER"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              icon={Phone}
              error={errors.mobile}
              maxLength={10}
              autoFocus
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
              Send Recovery OTP
            </Button>
          </div>

          <div className="text-center pt-3 border-t border-stone-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: Verify OTP */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4" noValidate>
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
              Verify OTP
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Enter new password */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit} className="space-y-4" noValidate>
          <div>
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              label="NEW PASSWORD"
              placeholder="Minimum 8 characters"
              value={formData.newPassword}
              onChange={handleChange}
              icon={Lock}
              error={errors.newPassword}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600 focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
            <PasswordStrengthMeter password={formData.newPassword} />
          </div>

          <div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="CONFIRM NEW PASSWORD"
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              error={errors.confirmPassword}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-stone-400 hover:text-stone-600 focus:outline-none p-1"
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
              Update Password & Sign In
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
