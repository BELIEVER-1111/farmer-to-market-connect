import React, { useState } from 'react';
import { Scale, Phone, BadgeCheck, KeyRound, CheckCircle2, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { generateAndSendOtp, verifyOtp, loginOperator, DEMO_OPERATOR } from '../../services/authService';
import { UserSession } from '../../types';

interface OperatorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const OperatorAuthModal: React.FC<OperatorAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [mobile, setMobile] = useState(DEMO_OPERATOR.mobile);
  const [employeeId, setEmployeeId] = useState(DEMO_OPERATOR.employeeId);
  const [otp, setOtp] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!employeeId.trim()) {
      setErrorMsg('Please enter your APMC Mandi Employee / Gate ID');
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
      setErrorMsg('Invalid OTP. Use 123456 for instant testing.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const res = loginOperator(mobile, employeeId);
      if (res.session) {
        onLoginSuccess(res.session);
        onClose();
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    const res = loginOperator(DEMO_OPERATOR.mobile, DEMO_OPERATOR.employeeId);
    if (res.session) {
      onLoginSuccess(res.session);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Market Operator theme */}
        <div className="bg-stone-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Market Operator Portal
                </h3>
                <p className="text-xs text-stone-300">
                  APMC Mandi Weighbridge, Assaying &amp; Gate Desk
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white text-lg p-1"
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
                  Operator Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-bold text-stone-500">+91</span>
                  <input
                    type="tel"
                    id="operator-mobile-input"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="98480 12345"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-stone-300 focus:border-stone-800 focus:bg-white rounded-xl text-sm font-bold text-stone-900 outline-hidden"
                  />
                  <Phone className="absolute right-3 w-4 h-4 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mandi Employee Badge / Station ID
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="operator-emp-id-input"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="APMC-VJA-204"
                    className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-300 focus:border-stone-800 focus:bg-white rounded-xl text-sm font-mono font-bold text-stone-900 outline-hidden"
                  />
                  <BadgeCheck className="absolute right-3 w-4 h-4 text-stone-400" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Assigned by APMC Market Committee / Mandi Directorate.
                </p>
              </div>

              <button
                type="button"
                id="operator-send-otp-btn"
                onClick={handleSendOtp}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Verify Credentials &amp; Request OTP
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  id="operator-quick-demo-btn"
                  onClick={handleQuickDemoLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Instant Test Login as Suresh Rao (Mandi Operator)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800">
                <p className="font-semibold">{otpSentMsg}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Operator OTP
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="operator-otp-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 focus:bg-white rounded-xl text-xl font-mono font-bold text-stone-900 tracking-widest text-center outline-hidden"
                  />
                  <KeyRound className="absolute right-3.5 w-5 h-5 text-stone-400" />
                </div>
              </div>

              <button
                type="button"
                id="operator-verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Access Mandi Weighbridge Desk'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-stone-600 hover:underline"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-stone-800 font-semibold hover:underline"
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
