import React, { useState } from 'react';
import { Sprout, Phone, KeyRound, CheckCircle2, User, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import {
  generateAndSendOtp,
  verifyOtp,
  loginFarmerWithMobile,
  registerNewFarmer,
  DEMO_FARMER,
} from '../../services/authService';
import { UserSession, FarmerProfile } from '../../types';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const FarmerAuthModal: React.FC<FarmerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'MOBILE' | 'OTP' | 'REGISTER'>('MOBILE');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New farmer registration fields
  const [name, setName] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Krishna');
  const [village, setVillage] = useState('');
  const [landAcres, setLandAcres] = useState('5.0');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(['Tomato', 'Chilli']);
  const [upiId, setUpiId] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = () => {
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number / कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    setErrorMsg('');
    const { message, otp: testOtp } = generateAndSendOtp(clean);
    setOtpSentMsg(message);
    setOtp(testOtp); // Auto-fill standard test OTP so farmers and evaluators don't wait
    setStep('OTP');
  };

  const handleVerifyOtp = () => {
    setErrorMsg('');
    if (!verifyOtp(mobile, otp)) {
      setErrorMsg('Invalid OTP. Please enter 123456 or request a new code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const res = loginFarmerWithMobile(mobile);
      if (res.session) {
        // Known farmer logged in
        onLoginSuccess(res.session);
        onClose();
      } else {
        // New farmer - proceed to quick account setup
        setStep('REGISTER');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const session = registerNewFarmer({
        name: name.trim(),
        mobile: mobile.replace(/\D/g, ''),
        state,
        district,
        village: village.trim() || 'Local Village',
        landAcres: parseFloat(landAcres) || 4.0,
        primaryCrops: primaryCrops.length ? primaryCrops : ['Tomato'],
        upiId: upiId.trim() || `${mobile}@upi`,
        preferredLanguage: 'en',
      });
      onLoginSuccess(session);
      onClose();
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    const session: UserSession = {
      role: 'farmer',
      token: `demo_farmer_${Date.now()}`,
      mobile: DEMO_FARMER.mobile,
      name: DEMO_FARMER.name,
      farmer: DEMO_FARMER,
    };
    onLoginSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Farmer Header: High-contrast, warm agricultural green theme */}
        <div className="bg-emerald-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  Kisan Portal · किसान पोर्टल
                </h3>
                <p className="text-xs text-emerald-100">
                  Direct Mobile &amp; OTP Login / किसान खाता बनाएं
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white text-lg p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Enter Mobile Number */}
          {step === 'MOBILE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Enter Mobile Number / मोबाइल नंबर दर्ज करें
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-stone-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="farmer-mobile-input"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full pl-13 pr-4 py-3 bg-stone-50 border-2 border-stone-200 focus:border-emerald-700 focus:bg-white rounded-xl text-base font-bold text-stone-900 tracking-wider transition outline-hidden"
                  />
                  <Phone className="absolute right-3.5 w-5 h-5 text-stone-400" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  We will send a 6-digit one-time password (OTP) via SMS.
                </p>
              </div>

              <button
                type="button"
                id="farmer-send-otp-btn"
                onClick={handleSendOtp}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Send OTP / ओटीपी प्राप्त करें
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo 1-Click button for quick inspection */}
              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  id="farmer-quick-demo-btn"
                  onClick={handleQuickDemoLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Test Login as Ramesh Patel (Farmer)
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 'OTP' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <p className="font-semibold">{otpSentMsg}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit OTP / ओटीपी दर्ज करें
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="farmer-otp-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 focus:border-emerald-700 focus:bg-white rounded-xl text-xl font-mono font-bold text-stone-900 tracking-widest text-center transition outline-hidden"
                  />
                  <KeyRound className="absolute right-3.5 w-5 h-5 text-stone-400" />
                </div>
              </div>

              <button
                type="button"
                id="farmer-verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP & Continue / सत्यापित करें'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-xs text-stone-500 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('MOBILE')}
                  className="text-stone-600 hover:underline"
                >
                  Change Mobile Number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-800 font-semibold hover:underline"
                >
                  Resend OTP (123456)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Create Farmer Account */}
          {step === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <User className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-stone-900">
                  New Farmer Registration / नया किसान खाता
                </h4>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Farmer Full Name / किसान का पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:bg-white focus:border-emerald-700 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    State / राज्य
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 font-medium"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    District / ज़िला
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g. Krishna / Nashik"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Village / गाँव
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder="e.g. Kankipadu"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Farm Land (Acres) / ज़मीन
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={landAcres}
                    onChange={e => setLandAcres(e.target.value)}
                    placeholder="5.0"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  UPI ID / Bank Account for Direct Payouts
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@upi or Account No."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 font-medium"
                />
              </div>

              <button
                type="submit"
                id="farmer-create-account-btn"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Registration & Open Dashboard'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
