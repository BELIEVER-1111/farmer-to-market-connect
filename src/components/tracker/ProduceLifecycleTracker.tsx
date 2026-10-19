import React, { useState } from 'react';
import {
  FarmerLot,
  LotTrackingStage,
  LotTrackingEvent,
} from '../../types';
import {
  getLotTrackingTimeline,
  TRACKING_STAGE_ORDER,
  advanceLotStage,
  getStoredLots,
} from '../../services/farmerLotsService';
import {
  CheckCircle2,
  Clock,
  Circle,
  Truck,
  ShieldCheck,
  Scale,
  Award,
  CreditCard,
  MapPin,
  Phone,
  ArrowRight,
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Search,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { WhatsAppTrackerCard } from './WhatsAppTrackerCard';
import { getWhatsAppShareUrl, recordWhatsAppAlert, generateWhatsAppTrackerMessage } from '../../services/whatsappService';

interface ProduceLifecycleTrackerProps {
  lot: FarmerLot;
  onLotUpdated?: (updatedLot: FarmerLot) => void;
  showOperatorControls?: boolean;
  onClose?: () => void;
  onSelectAnotherLot?: (lot: FarmerLot) => void;
}

export const ProduceLifecycleTracker: React.FC<ProduceLifecycleTrackerProps> = ({
  lot,
  onLotUpdated,
  showOperatorControls = false,
  onClose,
  onSelectAnotherLot,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'transport' | 'payment' | 'whatsapp'>('timeline');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [waNotice, setWaNotice] = useState<string | null>(null);

  const timeline = getLotTrackingTimeline(lot);
  const currentStageIndex = TRACKING_STAGE_ORDER.indexOf(lot.trackingStage || 'LISTED');
  const nextStage = currentStageIndex < TRACKING_STAGE_ORDER.length - 1 ? TRACKING_STAGE_ORDER[currentStageIndex + 1] : null;

  const handleAdvanceStage = (stage: LotTrackingStage) => {
    setIsUpdating(true);
    setTimeout(() => {
      const updated = advanceLotStage(lot.id, stage);
      if (updated && onLotUpdated) {
        onLotUpdated(updated);
      }
      setIsUpdating(false);

      // Record automated WhatsApp notification
      recordWhatsAppAlert({
        lotId: lot.id,
        stage,
        recipientMobile: lot.farmerMobile,
        recipientName: lot.farmerName,
        messageText: generateWhatsAppTrackerMessage(updated || lot),
      });
      setWaNotice(`Automated WhatsApp update dispatched to +91 ${lot.farmerMobile}!`);
      setTimeout(() => setWaNotice(null), 4000);
    }, 400);
  };

  const handleCopyLotId = () => {
    navigator.clipboard?.writeText(lot.id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const stageIcons: Record<LotTrackingStage, React.ReactNode> = {
    LISTED: <span className="text-base font-bold">🌾</span>,
    WEIGHED_IN_MANDI: <Scale className="w-4 h-4" />,
    ASSAYED_CERTIFIED: <Award className="w-4 h-4" />,
    ESCROW_LOCKED: <Lock className="w-4 h-4" />,
    IN_TRANSIT: <Truck className="w-4 h-4" />,
    DELIVERED_PAID: <CreditCard className="w-4 h-4" />,
  };

  const stageTitles: Record<LotTrackingStage, { en: string; hi: string }> = {
    LISTED: { en: 'Produce Listed', hi: 'फ़सल दर्ज' },
    WEIGHED_IN_MANDI: { en: 'Mandi Weighbridge', hi: 'मंडी तोल' },
    ASSAYED_CERTIFIED: { en: 'Quality Assayed', hi: 'गुणवत्ता प्रमाणित' },
    ESCROW_LOCKED: { en: 'Escrow Payment Locked', hi: 'सुरक्षित एस्क्रो' },
    IN_TRANSIT: { en: 'In Transit (GPS)', hi: 'वाहन रवाना' },
    DELIVERED_PAID: { en: 'Paid to Bank', hi: 'बैंक भुगतान' },
  };

  const payoutAmount = lot.netPayout || (lot.quantityQuintals * (lot.highestBidPrice || lot.expectedPricePerQtl));

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden text-stone-900">
      {/* Tracker Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-emerald-700/80 text-emerald-100 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                TRACKING ID: {lot.id.toUpperCase()}
              </span>
              <button
                onClick={handleCopyLotId}
                className="text-xs text-emerald-200 hover:text-white underline underline-offset-2"
                title="Copy tracking ID"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{lot.cropName}</span>
              <span className="text-sm font-normal text-emerald-200 px-2 py-0.5 bg-white/10 rounded-md">
                {lot.variety}
              </span>
              <span className="text-sm font-normal text-emerald-200">
                • {lot.quantityQuintals} Quintals (~{Math.round(lot.quantityQuintals * 0.1)} Tonnes)
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Farmer: <strong>{lot.farmerName}</strong> (+91 {lot.farmerMobile})</span>
              <span>•</span>
              <span>Target: <strong>{lot.targetMandi}</strong></span>
            </p>
          </div>

          {/* Right Status Badge */}
          <div className="text-right flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              <span>CURRENT STATUS:</span>
              <span className="uppercase tracking-wide text-emerald-200">
                {stageTitles[lot.trackingStage || 'LISTED'].en}
              </span>
            </div>
            <span className="text-xs text-emerald-200">
              {stageTitles[lot.trackingStage || 'LISTED'].hi}
            </span>

            {/* Direct WhatsApp Quick-Share Button */}
            <button
              type="button"
              onClick={() => {
                const url = getWhatsAppShareUrl(lot);
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="Send WhatsApp update to farmer"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white text-white" />
              <span>WhatsApp Tracker</span>
              <ExternalLink className="w-3 h-3 text-emerald-100" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="mt-2 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors"
              >
                Close View ✕
              </button>
            )}
          </div>
        </div>

        {/* 6-Stage Visual Stepper Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-700/50">
          <div className="hidden sm:grid sm:grid-cols-6 gap-2">
            {TRACKING_STAGE_ORDER.map((stageKey, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isFuture = idx > currentStageIndex;

              return (
                <div key={stageKey} className="flex flex-col items-center text-center relative group">
                  {/* Connecting Line */}
                  {idx < TRACKING_STAGE_ORDER.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-all ${
                        idx < currentStageIndex ? 'bg-emerald-400' : 'bg-emerald-800/80'
                      }`}
                    />
                  )}

                  {/* Stage Node Icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-emerald-400 text-emerald-950 font-bold shadow-md'
                        : isCurrent
                        ? 'bg-white text-emerald-900 ring-4 ring-emerald-300 shadow-lg scale-110 font-bold'
                        : 'bg-emerald-900/90 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : stageIcons[stageKey]}
                  </div>

                  {/* Labels */}
                  <div className="mt-2">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isCurrent ? 'text-white' : isPast ? 'text-emerald-200' : 'text-emerald-400/80'
                      }`}
                    >
                      {stageTitles[stageKey].en}
                    </p>
                    <p className="text-[10px] text-emerald-300/80 leading-none mt-0.5">
                      {stageTitles[stageKey].hi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Stepper Progress Bar */}
          <div className="sm:hidden">
            <div className="flex justify-between items-center text-xs text-emerald-200 mb-1">
              <span>Step {currentStageIndex + 1} of 6: <strong>{stageTitles[lot.trackingStage || 'LISTED'].en}</strong></span>
              <span>{Math.round(((currentStageIndex + 1) / 6) * 100)}%</span>
            </div>
            <div className="w-full bg-emerald-900/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStageIndex + 1) / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-emerald-600 text-emerald-900 bg-white'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-600" />
          Step-by-Step Operation Tracker
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'transport'
              ? 'border-emerald-600 text-emerald-900 bg-white'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-600" />
          Transportation & Live GPS
          {lot.transport && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'payment'
              ? 'border-emerald-600 text-emerald-900 bg-white'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Secure Bank Escrow & Payout
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'whatsapp'
              ? 'border-emerald-600 text-emerald-900 bg-white'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#25D366]" />
          <span>WhatsApp Live Updates</span>
          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
            Active
          </span>
        </button>
      </div>

      {/* Operator Live Control Bar (Advances stages easily) */}
      {showOperatorControls && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase">Operation Desk Controls</span>
              <p className="text-xs text-amber-800">
                You can advance this lot through the operational stages to update the farmer's live tracker in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {nextStage ? (
              <button
                onClick={() => handleAdvanceStage(nextStage)}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                Advance to: {stageTitles[nextStage].en} ({stageTitles[nextStage].hi})
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Full Lifecycle Completed & Paid!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Auto WhatsApp Notification Banner if dispatched */}
      {waNotice && (
        <div className="bg-[#25D366]/15 border-b border-[#25D366]/40 p-3 sm:px-6 flex items-center justify-between text-xs text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
            <span>{waNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const url = getWhatsAppShareUrl(lot);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="text-xs font-bold text-emerald-900 hover:underline flex items-center gap-1"
          >
            View in WhatsApp <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tab 1: Step-by-Step Operation Tracker */}
      {activeTab === 'timeline' && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Active Highlight Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {stageIcons[lot.trackingStage || 'LISTED']}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
                  ACTIVE STAGE ({currentStageIndex + 1} OF 6)
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  {stageTitles[lot.trackingStage || 'LISTED'].en} — {stageTitles[lot.trackingStage || 'LISTED'].hi}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 max-w-2xl">
                  {timeline[currentStageIndex]?.description}
                </p>
              </div>
            </div>

            <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 text-right shrink-0">
              <span className="text-[10px] uppercase text-stone-500 block font-semibold">Guaranteed Payout</span>
              <span className="text-base font-bold text-emerald-800">₹{payoutAmount.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-600 block">
                {lot.paymentStatus === 'SETTLED_TO_BANK' ? '✓ Credited in Account' : '🔒 Safe in Escrow Trust'}
              </span>
            </div>
          </div>

          {/* Quick WhatsApp Share Banner in Timeline */}
          <WhatsAppTrackerCard lot={lot} isOperatorView={showOperatorControls} />

          {/* Detailed Vertical Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
            {timeline.map((event, index) => {
              const isDone = event.status === 'COMPLETED';
              const isActive = event.status === 'ACTIVE';

              return (
                <div key={event.stage} className="relative group">
                  {/* Step Dot Marker */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isActive
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-200'
                        : isDone
                        ? 'bg-stone-50/70 border-stone-200'
                        : 'bg-stone-50/40 border-stone-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-500">STEP {index + 1}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isActive
                                ? 'bg-emerald-700 text-white animate-pulse'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900 mt-1">
                          {event.title}
                          <span className="text-xs font-normal text-stone-500 ml-2">({event.titleHi})</span>
                        </h4>
                      </div>

                      <div className="text-right text-xs text-stone-500">
                        <span className="font-medium text-stone-700 block">{event.timestamp}</span>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata Badges */}
                    {event.details && (
                      <div className="mt-3 pt-3 border-t border-stone-200/80 flex flex-wrap gap-3">
                        {Object.entries(event.details).map(([key, val]) => (
                          <div key={key} className="text-[11px] bg-white px-2.5 py-1 rounded-md border border-stone-200">
                            <span className="text-stone-500 uppercase text-[10px] mr-1">{key}:</span>
                            <strong className="text-stone-800">{String(val)}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {event.verifiedBy && (
                      <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Verified by: {event.verifiedBy}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Transportation & Live GPS */}
      {activeTab === 'transport' && (
        <div className="p-4 sm:p-6 space-y-6">
          {lot.transport ? (
            <div className="space-y-6">
              {/* Live Vehicle Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold text-xl shadow-inner">
                      🚚
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded text-xs font-mono font-semibold">
                          {lot.transport.vehicleNumber}
                        </span>
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          GPS Tracking Active
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-0.5">
                        {lot.transport.transporterName}
                      </h3>
                      <p className="text-xs text-stone-300">
                        Driver: <strong>{lot.transport.driverName}</strong>
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${lot.transport.driverMobile}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Driver ({lot.transport.driverMobile})
                  </a>
                </div>

                {/* Simulated GPS Route Tracker Card */}
                <div className="mt-5 p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs text-stone-300 mb-2">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <MapPin className="w-3.5 h-3.5" /> Current Location:
                    </span>
                    <span className="font-semibold text-white">{lot.transport.gpsCurrentLocation}</span>
                  </div>

                  {/* Route Bar */}
                  <div className="relative my-3">
                    <div className="h-2 w-full bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{
                          width:
                            lot.trackingStage === 'DELIVERED_PAID'
                              ? '100%'
                              : lot.trackingStage === 'IN_TRANSIT'
                              ? '65%'
                              : '15%',
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-stone-400 mt-1.5">
                      <span>Origin: {lot.transport.sourceLocation}</span>
                      <span>Route: ~{lot.transport.routeDistanceKm} KM</span>
                      <span className="text-right">Dest: {lot.transport.destinationHub}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Dispatched At</span>
                      <strong className="text-white">{lot.transport.dispatchTime}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Estimated Arrival</span>
                      <strong className="text-emerald-300">{lot.transport.estimatedArrival}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Produce Protection</span>
                      <strong className="text-white">Weather-Proof Tarp / Inspected</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transportation Steps Explainer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-bold">1</span>
                    Farmgate / Mandi Pickup
                  </div>
                  <p className="text-xs text-stone-600">
                    Weighed and loaded with official Gate Pass. Tare & Gross weights verified by electronic weighbridge.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-bold">2</span>
                    En-Route Live GPS Tracking
                  </div>
                  <p className="text-xs text-stone-600">
                    Vehicle satellite tracking ensures transparency. Driver contact is directly accessible to both farmer and buyer.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-bold">3</span>
                    Instant Delivery Unloading
                  </div>
                  <p className="text-xs text-stone-600">
                    Destination hub scans secure delivery QR. Automatically activates Escrow fund release to farmer.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <Truck className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-800">Transport Allocation in Queue</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                Vehicle assignment and driver allocation will occur automatically once the buyer locks escrow payment for this lot.
              </p>
              {showOperatorControls && (
                <button
                  onClick={() => handleAdvanceStage('IN_TRANSIT')}
                  className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
                >
                  Assign Logistics & Dispatch Truck Now
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Secure Bank Escrow & Payment */}
      {activeTab === 'payment' && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Security Guarantee Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-stone-950 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  100% Guaranteed Farmer Payout Protection
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                  Unlike traditional trade credit where farmers wait weeks for payment, our platform locks the buyer's 100% purchase amount in a regulated <strong>State Bank of India (SBI) Agri-Escrow Trust</strong> before goods are dispatched.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-700/60">
              <div className="bg-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase text-emerald-300 block font-semibold">Total Lot Value</span>
                <span className="text-lg font-bold text-white">₹{payoutAmount.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-emerald-200 block">Net to Farmer</span>
              </div>

              <div className="bg-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase text-emerald-300 block font-semibold">Escrow Trustee</span>
                <span className="text-sm font-bold text-white">SBI Agri-Escrow Trust</span>
                <span className="text-[11px] text-emerald-200 block">ID: {lot.escrow?.escrowId || 'ESC-SBI-2026-9912'}</span>
              </div>

              <div className="bg-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase text-emerald-300 block font-semibold">Payout Status</span>
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                  {lot.paymentStatus === 'SETTLED_TO_BANK' ? (
                    <>✓ SETTLED TO BANK</>
                  ) : (
                    <>🔒 LOCKED IN ESCROW</>
                  )}
                </span>
                <span className="text-[11px] text-emerald-100 block">
                  {lot.paymentStatus === 'SETTLED_TO_BANK' ? 'Instant UPI / NEFT Release' : 'Guaranteed upon delivery'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Certificate / Slip */}
          <div className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-stone-50">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              Direct Beneficiary Bank Settlement Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-white p-3.5 rounded-lg border border-stone-200">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Farmer Beneficiary:</span>
                  <strong className="text-stone-800">{lot.farmerName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Beneficiary UPI / Bank:</span>
                  <strong className="text-stone-800">{lot.escrow?.payoutAccount || `+91 ${lot.farmerMobile}@upi`}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Registered Mobile:</span>
                  <strong className="text-stone-800">+91 {lot.farmerMobile}</strong>
                </div>
              </div>

              <div className="space-y-2 bg-white p-3.5 rounded-lg border border-stone-200">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Buyer Entity:</span>
                  <strong className="text-stone-800">{lot.buyerName || 'ITC e-Choupal Hub'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Settlement Reference (UTR):</span>
                  <strong className="text-emerald-800 font-mono">
                    {lot.escrow?.utrNumber || (lot.paymentStatus === 'SETTLED_TO_BANK' ? 'SBIN26091588391024' : 'Auto-generates on delivery')}
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Platform Convenience Fee:</span>
                  <strong className="text-emerald-700">₹0 (Free for Farmers)</strong>
                </div>
              </div>
            </div>

            {/* If not settled yet, allow operator/demo release */}
            {showOperatorControls && lot.paymentStatus !== 'SETTLED_TO_BANK' && (
              <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-600">
                  Simulate buyer scanning delivery QR to release funds:
                </span>
                <button
                  onClick={() => handleAdvanceStage('DELIVERED_PAID')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Verify Delivery & Trigger Escrow Payout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: WhatsApp Live Updates Center */}
      {activeTab === 'whatsapp' && (
        <div className="p-4 sm:p-6 space-y-6">
          <WhatsAppTrackerCard lot={lot} isOperatorView={showOperatorControls} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp Alerts Information */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                How WhatsApp Tracking Works for Farmers
              </h4>
              <ul className="text-xs text-stone-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#25D366]">1.</span>
                  <span><strong>Zero Learning Curve:</strong> Farmers receive automatic notifications on WhatsApp without requiring app downloads or passwords.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#25D366]">2.</span>
                  <span><strong>Instant Weighment Slips:</strong> As soon as the Mandi operator confirms weighment, the gross & tare weight slip is messaged directly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#25D366]">3.</span>
                  <span><strong>Live GPS Driver Info:</strong> Truck vehicle number, driver contact number, and ETA are sent prior to truck departure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#25D366]">4.</span>
                  <span><strong>Bank UTR Settlement:</strong> Immediate bank transaction reference (UTR) is shared upon delivery confirmation.</span>
                </li>
              </ul>
            </div>

            {/* Direct Quick Actions */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700" />
                Farmer Communication & Helpline
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 block">Registered WhatsApp Number</span>
                    <strong className="text-stone-800 text-sm">+91 {lot.farmerMobile}</strong>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 block">Kisan Call Center / Mandi Desk</span>
                    <strong className="text-stone-800">1800-180-1551 (Toll Free)</strong>
                  </div>
                  <a
                    href="tel:18001801551"
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Call Desk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
