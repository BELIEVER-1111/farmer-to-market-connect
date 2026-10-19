import React, { useState } from 'react';
import {
  MessageSquare,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Bell,
  Smartphone,
  CheckCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { FarmerLot } from '../../types';
import {
  generateWhatsAppTrackerMessage,
  getWhatsAppShareUrl,
  recordWhatsAppAlert,
  isFarmerSubscribedToWhatsApp,
  setFarmerWhatsAppSubscription,
} from '../../services/whatsappService';

interface WhatsAppTrackerCardProps {
  lot: FarmerLot;
  className?: string;
  isOperatorView?: boolean;
}

export const WhatsAppTrackerCard: React.FC<WhatsAppTrackerCardProps> = ({
  lot,
  className = '',
  isOperatorView = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() =>
    isFarmerSubscribedToWhatsApp(lot.farmerMobile)
  );
  const [dispatchedSuccess, setDispatchedSuccess] = useState<string | null>(null);

  const messageText = generateWhatsAppTrackerMessage(lot);
  const whatsappUrl = getWhatsAppShareUrl(lot);

  const handleCopy = () => {
    navigator.clipboard?.writeText(messageText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    // Record alert in history
    recordWhatsAppAlert({
      lotId: lot.id,
      stage: lot.trackingStage || 'LISTED',
      recipientMobile: lot.farmerMobile,
      recipientName: lot.farmerName,
      messageText,
    });

    setDispatchedSuccess(`WhatsApp tracking update sent to +91 ${lot.farmerMobile}!`);
    setTimeout(() => setDispatchedSuccess(null), 5000);

    // Open WhatsApp URL in new window/tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleSubscription = () => {
    const next = !isSubscribed;
    setIsSubscribed(next);
    setFarmerWhatsAppSubscription(lot.farmerMobile, next);
  };

  return (
    <div
      id="whatsapp-tracker-card"
      className={`rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 p-4 sm:p-5 shadow-xs ${className}`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
            <MessageSquare className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">
                WhatsApp Live Produce Updates (व्हाट्सएप अपडेट)
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Instant Alerts
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Receive automated updates for weighment slips, quality grade, truck GPS, and bank payouts directly on WhatsApp.
            </p>
          </div>
        </div>

        {/* Subscription Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleToggleSubscription}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isSubscribed
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'text-emerald-300' : 'text-stone-400'}`} />
            <span>{isSubscribed ? 'WhatsApp Alerts: Active' : 'Enable Alerts'}</span>
          </button>
        </div>
      </div>

      {dispatchedSuccess && (
        <div className="mt-3 p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            {dispatchedSuccess}
          </span>
          <button
            type="button"
            onClick={() => setDispatchedSuccess(null)}
            className="text-emerald-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Smartphone className="w-4 h-4 text-emerald-700" />
          <span>
            Target WhatsApp: <strong>+91 {lot.farmerMobile}</strong> ({lot.farmerName})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>{showPreview ? 'Hide Message Preview' : 'Preview WA Message'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="send-whatsapp-update-btn"
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-white" />
            <span>
              {isOperatorView ? 'Dispatch WhatsApp to Farmer' : 'Open WhatsApp Tracker'}
            </span>
            <ExternalLink className="w-3 h-3 text-emerald-100" />
          </button>
        </div>
      </div>

      {/* WhatsApp Message Simulation Preview */}
      {showPreview && (
        <div className="mt-4 pt-4 border-t border-emerald-200/80 animate-in fade-in duration-150">
          <div className="max-w-xl mx-auto bg-[#EFEAE2] rounded-2xl p-3 sm:p-4 border border-stone-300 shadow-inner">
            {/* WhatsApp Chat Header */}
            <div className="bg-[#075E54] text-white rounded-t-xl px-3 py-2 flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-400 text-[#075E54] flex items-center justify-center font-bold text-[10px]">
                  🌱
                </div>
                <div>
                  <div className="font-bold">Farmer To Market Connect (Official)</div>
                  <div className="text-[10px] text-emerald-200">Verified Business Account</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-200 font-mono">Today</span>
            </div>

            {/* WhatsApp Message Bubble */}
            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-stone-200/70 text-xs text-stone-800 leading-relaxed font-sans relative">
              <pre className="whitespace-pre-wrap font-sans text-xs text-stone-800 select-text">
                {messageText}
              </pre>

              {/* Message Footer Time & Double Checkmark */}
              <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-stone-400">
                <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>

            {/* Action Bar inside Preview */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-600 px-1">
              <span>Farmer can tap the live link to open full GPS map &amp; UTR slip without login.</span>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="text-[#075E54] font-bold hover:underline flex items-center gap-1"
              >
                Send via WhatsApp <ArrowRight className="w-3 h-3 inline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ArrowRight(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
