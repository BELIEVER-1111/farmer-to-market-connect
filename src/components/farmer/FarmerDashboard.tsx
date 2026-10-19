import React, { useState } from 'react';
import {
  Sprout,
  PackagePlus,
  Truck,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  LogOut,
  Scale,
  Eye,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { FarmerProfile, FarmerLot } from '../../types';
import { getStoredLots, createFarmerLot } from '../../services/farmerLotsService';
import { getWhatsAppShareUrl } from '../../services/whatsappService';
import { ProduceLifecycleTracker } from '../tracker/ProduceLifecycleTracker';
import { ProduceTrackerModal } from '../tracker/ProduceTrackerModal';

interface FarmerDashboardProps {
  farmer: FarmerProfile;
  onLogout: () => void;
  onSelectCropForLookup: (cropName: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmer,
  onLogout,
  onSelectCropForLookup,
}) => {
  const [lots, setLots] = useState<FarmerLot[]>(() => {
    return getStoredLots().filter(l => l.farmerMobile === farmer.mobile || l.farmerId === farmer.id);
  });
  const [isCreatingLot, setIsCreatingLot] = useState(false);

  // Tracker state
  const [trackedLot, setTrackedLot] = useState<FarmerLot | null>(() => {
    const all = getStoredLots().filter(l => l.farmerMobile === farmer.mobile || l.farmerId === farmer.id);
    // Prefer lot currently in transit or weighed, else first
    return all.find(l => l.trackingStage === 'IN_TRANSIT') || all[0] || null;
  });
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);

  // New lot form state
  const [cropName, setCropName] = useState(farmer.primaryCrops[0] || 'Tomato');
  const [variety, setVariety] = useState('Desi FAQ');
  const [quantityQuintals, setQuantityQuintals] = useState(50);
  const [expectedPrice, setExpectedPrice] = useState(1250);
  const [targetMandi, setTargetMandi] = useState(`${farmer.district} APMC Mandi`);

  const handleCreateLotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot = createFarmerLot({
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerMobile: farmer.mobile,
      cropName,
      variety,
      quantityQuintals: Number(quantityQuintals),
      expectedPricePerQtl: Number(expectedPrice),
      targetMandi,
      harvestDate: new Date().toISOString().split('T')[0],
    });

    setLots(prev => [newLot, ...prev]);
    setTrackedLot(newLot);
    setIsCreatingLot(false);
  };

  const handleLotUpdated = (updated: FarmerLot) => {
    setLots(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    setTrackedLot(updated);
  };

  const totalSoldIncome = lots
    .filter(l => l.status === 'SOLD' || l.status === 'PAYMENT_RECEIVED' || l.paymentStatus === 'SETTLED_TO_BANK')
    .reduce((sum, l) => sum + (l.netPayout || (l.quantityQuintals * (l.highestBidPrice || l.expectedPricePerQtl))), 0);

  const activeLotsCount = lots.filter(l => l.status !== 'PAYMENT_RECEIVED' && l.paymentStatus !== 'SETTLED_TO_BANK').length;

  return (
    <div id="farmer-dashboard-container" className="space-y-4">
      {/* Farmer Greeting & Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <Sprout className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  नमस्ते, {farmer.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-500/40">
                  Verified Kisan
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                Village {farmer.village}, {farmer.district}, {farmer.state} · {farmer.landAcres} Acres
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Kisan ID</span>
              <span className="text-xs font-mono font-bold text-white">{farmer.kisanId}</span>
            </div>

            <button
              type="button"
              id="farmer-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-700/60 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200 text-[11px] block">Active Produce Lots</span>
            <strong className="text-base text-white">{activeLotsCount} Lots in Motion</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200 text-[11px] block">Total Harvest Earnings</span>
            <strong className="text-base text-white">₹{totalSoldIncome.toLocaleString('en-IN')}</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200 text-[11px] block">Bank / UPI Direct</span>
            <strong className="text-xs text-white truncate block">{farmer.upiId}</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-emerald-200 text-[11px] block">Escrow Guarantee</span>
              <strong className="text-xs text-emerald-300">100% Safe Payment</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingLot(true)}
              className="px-2.5 py-1 bg-white text-emerald-900 font-bold rounded-lg text-xs shadow-xs hover:bg-emerald-50 transition"
            >
              + New Lot
            </button>
          </div>
        </div>
      </div>

      {/* Primary Crop Fast-Check Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            My Registered Crops:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {farmer.primaryCrops.map(crop => (
              <button
                key={crop}
                type="button"
                onClick={() => onSelectCropForLookup(crop)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <span>{crop}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTrackerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Track Any Produce Lot (लॉट ट्रैक करें)</span>
          </button>

          <button
            type="button"
            id="open-create-lot-btn"
            onClick={() => setIsCreatingLot(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List Harvest Lot (नया माल जोड़ें)</span>
          </button>
        </div>
      </div>

      {/* Prominent Live Produce & Payout Tracker Spotlight */}
      {trackedLot && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Produce to Seller Tracker (फ़सल से विक्रेता तक लाइव ट्रैकर)</span>
            </h3>
            {lots.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-500">Switch Lot:</span>
                {lots.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setTrackedLot(l)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                      trackedLot.id === l.id
                        ? 'bg-emerald-800 text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {l.cropName} ({l.id})
                  </button>
                ))}
              </div>
            )}
          </div>

          <ProduceLifecycleTracker
            lot={trackedLot}
            onLotUpdated={handleLotUpdated}
            showOperatorControls={false}
          />
        </div>
      )}

      {/* Create Harvest Lot Modal */}
      {isCreatingLot && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Create Produce Harvest Lot
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Will be broadcasted to Mandi Weighbridge &amp; Verified Buyers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingLot(false)}
                className="text-stone-400 hover:text-stone-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLotSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Commodity / फ़सल चुनें
                </label>
                <select
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                >
                  <option value="Tomato">Tomato (टमाटर)</option>
                  <option value="Onion">Onion (प्याज़)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Wheat">Wheat (गेहूँ)</option>
                  <option value="Green Chilli">Green Chilli (हरी मिर्च)</option>
                  <option value="Soyabean">Soyabean (सोयाबीन)</option>
                  <option value="Bengal Gram (Gram/Chana)">Chana (चना)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Variety / बीज प्रकार
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  placeholder="e.g. Hybrid Vaishali, Shriram 404"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Approx Qty (Quintals)
                  </label>
                  <input
                    type="number"
                    value={quantityQuintals}
                    onChange={e => setQuantityQuintals(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Expected Rate (₹/Qtl)
                  </label>
                  <input
                    type="number"
                    value={expectedPrice}
                    onChange={e => setExpectedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Target Mandi
                </label>
                <input
                  type="text"
                  value={targetMandi}
                  onChange={e => setTargetMandi(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Once listed, you can track weighment, assay certification, secure escrow deposit, truck GPS, and bank payout step-by-step.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingLot(false)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-lot-btn"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Publish Harvest Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer's Active Produce Lots Table */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <PackagePlus className="w-4 h-4 text-emerald-800" />
              My Registered Produce Lots (मेरे फ़सल लॉट)
            </h3>
            <p className="text-[11px] text-stone-500">
              Click "Track Lot" to see live weighment, quality assay, escrow deposit, transport GPS, and bank payout.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-600 text-[11px] font-semibold">
                <th className="py-2.5 px-3">Lot ID &amp; Crop</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Target Mandi</th>
                <th className="py-2.5 px-3">Weighbridge &amp; Quality</th>
                <th className="py-2.5 px-3">Tracking Stage</th>
                <th className="py-2.5 px-3">Buyer &amp; Escrow</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lots.map(lot => (
                <tr key={lot.id} className="hover:bg-stone-50/60 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900 text-xs">{lot.cropName}</div>
                    <div className="text-[10px] text-stone-500">{lot.variety} · {lot.id.toUpperCase()}</div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-stone-800">
                    {lot.quantityQuintals} Quintals
                  </td>

                  <td className="py-3 px-3 text-stone-600">
                    {lot.targetMandi}
                  </td>

                  <td className="py-3 px-3">
                    {lot.weighmentTonnes ? (
                      <div>
                        <span className="font-bold text-stone-900">{lot.weighmentTonnes} Tonnes</span>
                        <div className="text-[10px] text-emerald-700 font-semibold">{lot.qualityAssayGrade}</div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic">Awaiting Mandi Gate</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                        lot.trackingStage === 'DELIVERED_PAID'
                          ? 'bg-emerald-100 text-emerald-900'
                          : lot.trackingStage === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-300'
                          : lot.trackingStage === 'ESCROW_LOCKED'
                          ? 'bg-teal-100 text-teal-900'
                          : lot.trackingStage === 'WEIGHED_IN_MANDI' || lot.trackingStage === 'ASSAYED_CERTIFIED'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {lot.trackingStage === 'IN_TRANSIT' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                      )}
                      {lot.trackingStage === 'DELIVERED_PAID' ? 'Delivered & Paid' : lot.trackingStage || lot.status}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {lot.buyerName ? (
                      <div>
                        <div className="font-medium text-stone-900 text-[11px] truncate max-w-[140px]">{lot.buyerName}</div>
                        <div className="text-[10px] font-bold text-emerald-800">
                          ₹{(lot.netPayout || lot.quantityQuintals * (lot.highestBidPrice || lot.expectedPricePerQtl)).toLocaleString('en-IN')}
                          <span className="text-stone-400 font-normal ml-1">
                            ({lot.paymentStatus === 'SETTLED_TO_BANK' ? 'Paid' : 'Escrow Locked'})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-500">Exp: ₹{lot.expectedPricePerQtl}/qtl</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const url = getWhatsAppShareUrl(lot);
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Receive live crop tracking update on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white text-white" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTrackedLot(lot);
                          setIsTrackerModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Track Lot</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Produce Tracker Modal */}
      <ProduceTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        initialLotId={trackedLot?.id}
        isOperatorView={false}
      />
    </div>
  );
};
