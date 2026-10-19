import React, { useState } from 'react';
import { ShieldAlert, Phone, ShieldCheck, KeyRound, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { generateAndSendOtp, verifyOtp, loginAdmin, DEMO_ADMIN } from '../../services/authService';
import { UserSession } from '../../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [mobile, setMobile] = useState(DEMO_ADMIN.mobile);
  const [adminCode, setAdminCode] = useState(DEMO_ADMIN.adminCode);
  const [otp, setOtp] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit administrator mobile number');
      return;
    }
    if (!adminCode.trim()) {
      setErrorMsg('Please enter your Administrator Access Passcode');
      return;
    }

    setErrorMsg('');
    const { message, otp: testOtp } = generateAndSendOtp(clean);
    setOtpSentMsg(message);
    setOtp(testOtp);
    setStep('OTP');
  };

  const handleVerifyOtp = () => {
    setErrorMsg('');
    if (!verifyOtp(mobile, otp)) {
      setErrorMsg('Invalid OTP. Use 123456 for instant verification.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const res = loginAdmin(mobile, adminCode);
      if (res.session) {
        onLoginSuccess(res.session);
        onClose();
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    const res = loginAdmin(DEMO_ADMIN.mobile, DEMO_ADMIN.adminCode);
    if (res.session) {
      onLoginSuccess(res.session);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Admin theme */}
        <div className="bg-blue-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  System Administrator Portal
                </h3>
                <p className="text-xs text-blue-200">
                  Marketplace Governance, Rate Limits &amp; Telemetry
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-blue-300 hover:text-white text-lg p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {step === 'DETAILS' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Admin Authorized Mobile
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-bold text-stone-500">+91</span>
                  <input
                    type="tel"
                    id="admin-mobile-input"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="99887 76655"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-stone-300 focus:border-blue-900 focus:bg-white rounded-xl text-sm font-bold text-stone-900 outline-hidden"
                  />
                  <Phone className="absolute right-3 w-4 h-4 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Admin Passcode / Security Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    id="admin-passcode-input"
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                    placeholder="ADMIN-AGMARK-77"
                    className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-300 focus:border-blue-900 focus:bg-white rounded-xl text-sm font-mono font-bold text-stone-900 outline-hidden"
                  />
                  <ShieldCheck className="absolute right-3 w-4 h-4 text-stone-400" />
                </div>
              </div>

              <button
                type="button"
                id="admin-send-otp-btn"
                onClick={handleSendOtp}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Verify Passcode &amp; Request OTP
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  id="admin-quick-demo-btn"
                  onClick={handleQuickDemoLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Instant Test Login as Dr. Kavita Sharma (Admin)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
                <p className="font-semibold">{otpSentMsg}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Admin Verification OTP
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="admin-otp-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-stone-50 border-2 border-stone-200 focus:border-blue-900 focus:bg-white rounded-xl text-xl font-mono font-bold text-stone-900 tracking-widest text-center outline-hidden"
                  />
                  <KeyRound className="absolute right-3.5 w-5 h-5 text-stone-400" />
                </div>
              </div>

              <button
                type="button"
                id="admin-verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Authorizing...' : 'Authorize Admin Console'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-stone-600 hover:underline"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-900 font-semibold hover:underline"
                >
                  Resend OTP (123456)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
