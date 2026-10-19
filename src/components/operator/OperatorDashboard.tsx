import React, { useState } from 'react';
import {
  Scale,
  BadgeCheck,
  CheckCircle2,
  FileCheck,
  Building2,
  Truck,
  Plus,
  RefreshCw,
  LogOut,
  MapPin,
  TrendingUp,
  Package,
  ShieldCheck,
  Lock,
  CreditCard,
  Eye,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { OperatorProfile, FarmerLot, OperatorWeighmentSlip, LotTrackingStage } from '../../types';
import {
  getStoredLots,
  updateLotStatus,
  getOperatorSlips,
  addOperatorSlip,
  advanceLotStage,
} from '../../services/farmerLotsService';
import {
  getWhatsAppShareUrl,
  recordWhatsAppAlert,
  generateWhatsAppTrackerMessage,
} from '../../services/whatsappService';
import { ProduceLifecycleTracker } from '../tracker/ProduceLifecycleTracker';
import { ProduceTrackerModal } from '../tracker/ProduceTrackerModal';

interface OperatorDashboardProps {
  operator: OperatorProfile;
  onLogout: () => void;
  onSelectCropForLookup: (cropName: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  operator,
  onLogout,
  onSelectCropForLookup,
}) => {
  const [allLots, setAllLots] = useState<FarmerLot[]>(() => getStoredLots());
  const [slips, setSlips] = useState<OperatorWeighmentSlip[]>(() => getOperatorSlips());
  const [selectedLotToWeigh, setSelectedLotToWeigh] = useState<FarmerLot | null>(null);

  // Tracker state
  const [activeTrackedLot, setActiveTrackedLot] = useState<FarmerLot | null>(() => {
    const lots = getStoredLots();
    return lots.find(l => l.trackingStage === 'IN_TRANSIT') || lots[0] || null;
  });
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);

  // Weighbridge & Assay Form state
  const [grossWeightTonnes, setGrossWeightTonnes] = useState<number>(4.5);
  const [moisturePct, setMoisturePct] = useState<number>(11.5);
  const [qualityGrade, setQualityGrade] = useState<'Grade-A' | 'Grade-B' | 'Standard FAQ' | 'Sub-Standard'>('Grade-A');
  const [verifiedSuccessMsg, setVerifiedSuccessMsg] = useState<string | null>(null);

  // Today's mandi rate broadcaster
  const [todayCrop, setTodayCrop] = useState('Tomato');
  const [todayModal, setTodayModal] = useState(1220);
  const [todayMin, setTodayMin] = useState(1050);
  const [todayMax, setTodayMax] = useState(1350);
  const [rateBroadcasted, setRateBroadcasted] = useState(false);

  const handleLotUpdated = (updated: FarmerLot) => {
    setAllLots(getStoredLots());
    setActiveTrackedLot(updated);
    setVerifiedSuccessMsg(`Updated stage for ${updated.cropName} (${updated.id}) to ${updated.trackingStage}!`);
  };

  const handleVerifyAndWeigh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotToWeigh) return;

    const netQuintals = Math.round(grossWeightTonnes * 10);
    const slip: OperatorWeighmentSlip = {
      slipId: `SLIP-APMC-${Date.now().toString().slice(-5)}`,
      lotId: selectedLotToWeigh.id,
      farmerName: selectedLotToWeigh.farmerName,
      farmerMobile: selectedLotToWeigh.farmerMobile,
      commodity: selectedLotToWeigh.cropName,
      variety: selectedLotToWeigh.variety,
      grossWeightTonnes,
      netWeightQuintals: netQuintals,
      moisturePct,
      qualityGrade,
      gatePassNo: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      verifiedBy: operator.name,
    };

    addOperatorSlip(slip);
    setSlips(prev => [slip, ...prev]);

    // Advance lot to WEIGHED_IN_MANDI stage
    const updated = advanceLotStage(selectedLotToWeigh.id, 'WEIGHED_IN_MANDI', {
      weighmentTonnes: grossWeightTonnes,
      qualityAssayGrade: `${qualityGrade} (Moisture ${moisturePct}%)`,
      quantityQuintals: netQuintals,
      gatePassNo: slip.gatePassNo,
    });

    // Automatically send WhatsApp status alert to farmer
    recordWhatsAppAlert({
      lotId: selectedLotToWeigh.id,
      stage: 'WEIGHED_IN_MANDI',
      recipientMobile: selectedLotToWeigh.farmerMobile,
      recipientName: selectedLotToWeigh.farmerName,
      messageText: generateWhatsAppTrackerMessage(updated || selectedLotToWeigh),
    });

    setAllLots(getStoredLots());
    if (updated) setActiveTrackedLot(updated);
    setVerifiedSuccessMsg(`Weighment slip #${slip.slipId} recorded & WhatsApp alert sent to ${selectedLotToWeigh.farmerName} (+91 ${selectedLotToWeigh.farmerMobile})!`);
    setSelectedLotToWeigh(null);
  };

  const handleBroadcastRate = (e: React.FormEvent) => {
    e.preventDefault();
    setRateBroadcasted(true);
    setTimeout(() => setRateBroadcasted(false), 4000);
  };

  const handleQuickAdvance = (lot: FarmerLot, targetStage: LotTrackingStage) => {
    const updated = advanceLotStage(lot.id, targetStage);
    if (updated) {
      // Record WhatsApp status update to farmer
      recordWhatsAppAlert({
        lotId: lot.id,
        stage: targetStage,
        recipientMobile: lot.farmerMobile,
        recipientName: lot.farmerName,
        messageText: generateWhatsAppTrackerMessage(updated),
      });

      setAllLots(getStoredLots());
      setActiveTrackedLot(updated);
      setVerifiedSuccessMsg(`Lot ${lot.id.toUpperCase()} advanced to ${targetStage} & WhatsApp update sent to ${lot.farmerName}!`);
    }
  };

  return (
    <div id="operator-dashboard-container" className="space-y-4">
      {/* Operator Header Bar */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-sm border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {operator.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  APMC Operator Desk
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                {operator.mandiName}, {operator.mandiDistrict} · ID: {operator.employeeId} · {operator.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTrackerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Produce Lifecycle Tracker</span>
            </button>

            <button
              type="button"
              id="operator-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit Desk
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-800 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-stone-400 text-[11px] block">Pending Gate Weighments</span>
            <strong className="text-base text-amber-400">
              {allLots.filter(l => l.trackingStage === 'LISTED').length} Lots
            </strong>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-stone-400 text-[11px] block">In Transit Vehicles</span>
            <strong className="text-base text-blue-400">
              {allLots.filter(l => l.trackingStage === 'IN_TRANSIT').length} Trucks Live
            </strong>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-stone-400 text-[11px] block">Escrow Settled Today</span>
            <strong className="text-base text-emerald-400">
              ₹{allLots.filter(l => l.trackingStage === 'DELIVERED_PAID').reduce((sum, l) => sum + (l.netPayout || 0), 0).toLocaleString('en-IN')}
            </strong>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-stone-400 text-[11px] block">Gate Status</span>
            <strong className="text-xs text-emerald-400">Open · Continuous Flow</strong>
          </div>
        </div>
      </div>

      {verifiedSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between">
          <span>{verifiedSuccessMsg}</span>
          <button type="button" onClick={() => setVerifiedSuccessMsg(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Live Produce Lifecycle & Dispatch Tracker Spotlight in Operator Desk */}
      {activeTrackedLot && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Active Operation &amp; Dispatch Tracker (ऑपरेशन एवं वाहन ट्रैकर)</span>
            </h3>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500">Select Lot:</span>
              {allLots.map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveTrackedLot(l)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTrackedLot.id === l.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {l.cropName} ({l.id.toUpperCase()})
                </button>
              ))}
            </div>
          </div>

          <ProduceLifecycleTracker
            lot={activeTrackedLot}
            onLotUpdated={handleLotUpdated}
            showOperatorControls={true}
          />
        </div>
      )}

      {/* 2-Column Workflow: Mandi Daily Rate Broadcast & Incoming Lots Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Weighbridge & Assay Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Mandi Gate Arrival &amp; Operational Stage Control
                </h3>
                <p className="text-[11px] text-stone-500">
                  Manage lots through each stage: Weighbridge, Assaying, Escrow Lock, Transport Dispatch, and Payout.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-600 text-[11px] font-semibold">
                    <th className="py-2.5 px-3">Farmer &amp; Crop</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Operational Stage</th>
                    <th className="py-2.5 px-3 text-right">Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {allLots.map(lot => (
                    <tr key={lot.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{lot.farmerName}</div>
                        <div className="text-[10px] text-stone-500">
                          {lot.cropName} ({lot.variety}) · +91 {lot.farmerMobile}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-stone-800">
                        {lot.quantityQuintals} Qtl
                        {lot.weighmentTonnes && (
                          <div className="text-[10px] text-emerald-700">{lot.weighmentTonnes} Tonnes (Gross)</div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            lot.trackingStage === 'DELIVERED_PAID'
                              ? 'bg-emerald-100 text-emerald-900'
                              : lot.trackingStage === 'IN_TRANSIT'
                              ? 'bg-blue-100 text-blue-900'
                              : lot.trackingStage === 'ESCROW_LOCKED'
                              ? 'bg-teal-100 text-teal-900'
                              : lot.trackingStage === 'WEIGHED_IN_MANDI' || lot.trackingStage === 'ASSAYED_CERTIFIED'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {lot.trackingStage || lot.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTrackedLot(lot);
                              setIsTrackerModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition border border-stone-300 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Track
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const url = getWhatsAppShareUrl(lot);
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-2 py-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Send WhatsApp update to farmer"
                          >
                            <MessageSquare className="w-3 h-3 fill-white" />
                            <span>WA</span>
                          </button>

                          {lot.trackingStage === 'LISTED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLotToWeigh(lot);
                                setGrossWeightTonnes(Math.round((lot.quantityQuintals / 10) * 10) / 10);
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
                            >
                              Weigh &amp; Assay
                            </button>
                          )}

                          {lot.trackingStage === 'WEIGHED_IN_MANDI' && (
                            <button
                              type="button"
                              onClick={() => handleQuickAdvance(lot, 'ESCROW_LOCKED')}
                              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" />
                              Lock Escrow
                            </button>
                          )}

                          {lot.trackingStage === 'ESCROW_LOCKED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickAdvance(lot, 'IN_TRANSIT')}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" />
                              Dispatch Truck
                            </button>
                          )}

                          {lot.trackingStage === 'IN_TRANSIT' && (
                            <button
                              type="button"
                              onClick={() => handleQuickAdvance(lot, 'DELIVERED_PAID')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              Confirm Delivery &amp; Payout
                            </button>
                          )}

                          {lot.trackingStage === 'DELIVERED_PAID' && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Mandi Rate Broadcaster & Assayed Slips (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Operator Rate Broadcaster */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              Live Mandi Price Bulletin Update
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">
              Operator can publish {operator.mandiName} today&#39;s auction closing price to the live public feed.
            </p>

            <form onSubmit={handleBroadcastRate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Commodity</label>
                <select
                  value={todayCrop}
                  onChange={e => setTodayCrop(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Green Chilli">Green Chilli</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Min (₹/Qtl)</label>
                  <input
                    type="number"
                    value={todayMin}
                    onChange={e => setTodayMin(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Modal (₹/Qtl)</label>
                  <input
                    type="number"
                    value={todayModal}
                    onChange={e => setTodayModal(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-emerald-400 rounded-lg text-xs font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Max (₹/Qtl)</label>
                  <input
                    type="number"
                    value={todayMax}
                    onChange={e => setTodayMax(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              {rateBroadcasted && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 font-semibold">
                  ✓ Rate bulletin published to state &amp; national Agmarknet node!
                </div>
              )}

              <button
                type="submit"
                id="broadcast-mandi-rate-btn"
                className="w-full py-2 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Broadcast Today&#39;s Mandi Price
              </button>
            </form>
          </div>

          {/* Certified Weighment Slips Feed */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
              Certified Gate Pass &amp; Assay Slips
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {slips.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No slips issued in this session yet.</p>
              ) : (
                slips.map(slip => (
                  <div key={slip.slipId} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>{slip.farmerName} · {slip.commodity}</span>
                      <span className="text-emerald-800">{slip.grossWeightTonnes} Tonnes</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>{slip.qualityGrade} (Moisture {slip.moisturePct}%)</span>
                      <span className="font-mono">{slip.slipId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weigh & Assay Modal */}
      {selectedLotToWeigh && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Weighbridge Entry &amp; Quality Assay
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Lot: {selectedLotToWeigh.cropName} · {selectedLotToWeigh.farmerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLotToWeigh(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyAndWeigh} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Electronic Weighbridge Gross Weight (Tonnes)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={grossWeightTonnes}
                  onChange={e => setGrossWeightTonnes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-bold text-stone-900"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Net Produce: ~{Math.round(grossWeightTonnes * 10)} Quintals
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Moisture Meter Test (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePct}
                    onChange={e => setMoisturePct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Assay Quality Grade
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={e => setQualityGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                  >
                    <option value="Grade-A">Grade-A (Premium)</option>
                    <option value="Grade-B">Grade-B (Good)</option>
                    <option value="Standard FAQ">Standard FAQ</option>
                    <option value="Sub-Standard">Sub-Standard</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedLotToWeigh(null)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Certify &amp; Issue Mandi Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Produce Tracker Modal */}
      <ProduceTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        initialLotId={activeTrackedLot?.id}
        isOperatorView={true}
      />
    </div>
  );
};
