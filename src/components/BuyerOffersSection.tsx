import React, { useState } from 'react';
import { Building2, ShieldCheck, Check, Package, FileText } from 'lucide-react';
import { BuyerOffer } from '../types';

interface BuyerOffersSectionProps {
  offers: BuyerOffer[];
  commodityName: string;
  modalPrice: number;
}

export const BuyerOffersSection: React.FC<BuyerOffersSectionProps> = ({
  offers,
  commodityName,
  modalPrice,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<BuyerOffer | null>(null);
  const [lotCreated, setLotCreated] = useState(false);

  return (
    <div id="buyer-offers-section" className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div>
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-800" />
            Active Institutional & Processor Buyer Demands ({commodityName})
          </h4>
          <p className="text-[11px] text-stone-500">
            Verified corporate buyers & FPOs seeking supply · Direct digital contract with escrow payment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {offers.slice(0, 3).map(offer => {
          const premium = offer.offeredPrice - modalPrice;
          return (
            <div
              key={offer.id}
              id={`buyer-offer-card-${offer.id}`}
              className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1">
                      {offer.buyerName}
                      <span title="Verified Buyer" className="inline-flex">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      </span>
                    </h5>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {offer.buyerType} · Posted {offer.postedAgo}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    ₹{offer.offeredPrice}/qtl
                  </span>
                </div>

                <div className="space-y-1 my-2 text-[11px] text-stone-600 bg-white border border-stone-200/80 rounded-lg p-2">
                  <div className="flex justify-between">
                    <span>Demand Volume:</span>
                    <strong className="text-stone-900">{offer.requiredVolumeQuintals} Quintals</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Grade:</span>
                    <span className="text-stone-800 font-medium">{offer.minQualitySpecs.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moisture Spec:</span>
                    <span className="text-stone-800 font-medium">&lt; {offer.minQualitySpecs.moistureMaxPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logistics:</span>
                    <span className="text-emerald-800 font-medium">{offer.pickupType}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 text-[10px] truncate max-w-[150px]">
                  {offer.paymentTerms}
                </span>
                <button
                  type="button"
                  id={`connect-buyer-btn-${offer.id}`}
                  onClick={() => {
                    setSelectedOffer(offer);
                    setLotCreated(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-md transition shadow-2xs cursor-pointer"
                >
                  Create Lot
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lot Creation Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-800" />
                Initiate Farmer Lot Offer
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="text-stone-400 hover:text-stone-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {lotCreated ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-900 mb-1">
                  Lot Offer Transmitted!
                </h4>
                <p className="text-xs text-stone-600 mb-4 max-w-sm mx-auto">
                  Your lot of {commodityName} at ₹{selectedOffer.offeredPrice}/quintal has been sent to {selectedOffer.buyerName}. An escrow payment guarantee has been reserved.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedOffer(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition"
                >
                  Return to Price Dashboard
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Buyer:</span>
                    <strong className="text-stone-900">{selectedOffer.buyerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Commodity:</span>
                    <span className="font-semibold text-stone-900">{commodityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Offered Rate:</span>
                    <strong className="text-emerald-800">₹{selectedOffer.offeredPrice}/quintal</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Settlement:</span>
                    <span className="text-stone-700">{selectedOffer.paymentTerms}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Lot Quantity (Quintals)
                    </label>
                    <input
                      type="number"
                      defaultValue={50}
                      min={10}
                      max={500}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-md text-xs font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      defaultValue="Farm Gate / Village Sourcing Point"
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-md text-xs text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOffer(null)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="confirm-submit-lot-btn"
                    onClick={() => setLotCreated(true)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition shadow-2xs"
                  >
                    Submit Lot to Buyer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
