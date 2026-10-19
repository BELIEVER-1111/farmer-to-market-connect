import React from 'react';
import { TrendingUp, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { NearbyBetterMarket } from '../types';

interface NearbyMarketsTableProps {
  markets: NearbyBetterMarket[];
  currentMarketName: string;
  onSelectMarket: (state: string, district: string, marketName: string) => void;
}

export const NearbyMarketsTable: React.FC<NearbyMarketsTableProps> = ({
  markets,
  currentMarketName,
  onSelectMarket,
}) => {
  if (!markets || markets.length === 0) {
    return (
      <div id="nearby-markets-section" className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs text-center">
        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Alternative Nearby Mandis
        </h4>
        <p className="text-xs text-stone-500">
          Current market ({currentMarketName}) is currently offering the best reported price within regional transit range.
        </p>
      </div>
    );
  }

  return (
    <div id="nearby-markets-section" className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div>
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-800" />
            Nearby Markets Offering Better Prices
          </h4>
          <p className="text-[11px] text-stone-500">
            Ranked by distance from {currentMarketName} · Net benefit calculated after deducting transport costs
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-600 text-[11px] font-semibold">
              <th className="py-2.5 px-3">Mandi / Market</th>
              <th className="py-2.5 px-3">Distance</th>
              <th className="py-2.5 px-3">Modal Price</th>
              <th className="py-2.5 px-3">Gross Difference</th>
              <th className="py-2.5 px-3">Est. Transport Cost</th>
              <th className="py-2.5 px-3 text-right">Net Extra Gain</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {markets.map((m, idx) => (
              <tr
                key={m.mandiId}
                id={`nearby-mandi-row-${idx}`}
                className="hover:bg-emerald-50/40 transition group"
              >
                {/* Mandi Name & District */}
                <td className="py-2.5 px-3 font-semibold text-stone-900">
                  <div className="flex items-center gap-1.5">
                    <span>{m.name}</span>
                    {m.isRecommended && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> High Net Gain
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-normal text-stone-500">
                    {m.district}, {m.state}
                  </div>
                </td>

                {/* Distance in km (ranked by distance) */}
                <td className="py-2.5 px-3 text-stone-700 font-medium">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-stone-400" />
                    <span>{m.distanceKm} km</span>
                  </div>
                </td>

                {/* Modal Price */}
                <td className="py-2.5 px-3 font-bold text-stone-900">
                  ₹{m.modalPrice.toLocaleString('en-IN')}/qtl
                </td>

                {/* Gross Difference */}
                <td className="py-2.5 px-3 font-semibold text-emerald-700">
                  +₹{m.priceDifference}/qtl
                </td>

                {/* Transport cost */}
                <td className="py-2.5 px-3 text-stone-500">
                  ~₹{m.estTransportCostPerQtl}/qtl
                </td>

                {/* Net Extra Benefit */}
                <td className="py-2.5 px-3 text-right font-bold">
                  <span className={`px-2 py-0.5 rounded text-xs inline-block ${
                    m.netExtraBenefitPerQtl > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {m.netExtraBenefitPerQtl > 0 ? `+₹${m.netExtraBenefitPerQtl}/qtl` : `₹${m.netExtraBenefitPerQtl}/qtl`}
                  </span>
                </td>

                {/* Action button */}
                <td className="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    id={`switch-to-mandi-${m.mandiId}`}
                    onClick={() => onSelectMarket(m.state, m.district, m.name)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded bg-stone-100 hover:bg-emerald-100 border border-stone-200 transition cursor-pointer"
                  >
                    View Prices
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
