import React, { useState } from 'react';
import { Clock, Info, ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2 } from 'lucide-react';
import { CropPriceLookupResult } from '../types';

interface PriceDisplayCardProps {
  data: CropPriceLookupResult;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const PriceDisplayCard: React.FC<PriceDisplayCardProps> = ({ data, isLoading, onRefresh }) => {
  const [unit, setUnit] = useState<'quintal' | 'kg'>('quintal');

  const divisor = unit === 'quintal' ? 1 : 100;
  const unitLabel = unit === 'quintal' ? '/qtl' : '/kg';

  const modalDisplay = Math.round((data.currentPrice.modalPrice / divisor) * 10) / 10;
  const minDisplay = Math.round((data.currentPrice.minPrice / divisor) * 10) / 10;
  const maxDisplay = Math.round((data.currentPrice.maxPrice / divisor) * 10) / 10;

  const isCache = data.freshness.isFromCache;
  const hasFallback = !data.isExactMarket && data.fallbackReason;

  return (
    <div id="price-display-card" className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs transition-all relative overflow-hidden">
      {/* Background soft tint */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-radial from-emerald-50 to-transparent pointer-events-none -z-0 opacity-60" />

      {/* Fallback Warning / Notice Banner if applicable */}
      {hasFallback && (
        <div id="fallback-notification-banner" className="mb-4 p-3 bg-amber-50/90 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-950">Market Fallback Notice: </span>
            <span>{data.fallbackReason}</span>
          </div>
        </div>
      )}

      {/* Header bar: Commodity + Market + Freshness + Unit Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              {data.commodity}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-stone-100 text-stone-700 border border-stone-200">
              Variety: {data.variety}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              {data.category}
            </span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
            <span>Mandi:</span>
            <span className="font-semibold text-stone-800">{data.actualReportingMarket}</span>
            <span>({data.actualReportingDistrict}, {data.actualReportingState})</span>
          </div>
        </div>

        {/* Right side: Unit Switcher & Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Unit Toggle */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100 text-xs font-semibold">
            <button
              type="button"
              id="unit-toggle-quintal"
              onClick={() => setUnit('quintal')}
              className={`px-2.5 py-1 rounded-md transition ${
                unit === 'quintal' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              ₹ / Quintal
            </button>
            <button
              type="button"
              id="unit-toggle-kg"
              onClick={() => setUnit('kg')}
              className={`px-2.5 py-1 rounded-md transition ${
                unit === 'kg' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              ₹ / Kg
            </button>
          </div>

          {onRefresh && (
            <button
              type="button"
              id="refresh-price-btn"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh price"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg border border-stone-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Modal Price (Primary) */}
        <div id="modal-price-metric" className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-medium mb-1">
            <span>Modal / Standard Price</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
              Agmarknet Benchmark
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold text-emerald-950 tracking-tight">
              ₹{modalDisplay.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-emerald-800">{unitLabel}</span>
          </div>
          <div className="text-[11px] text-emerald-800/80 flex items-center justify-between mt-1 pt-1 border-t border-emerald-200/60">
            <span>Daily Mandi Arrivals</span>
            <span className="font-semibold text-emerald-900">{data.currentPrice.arrivalVolumeTonnes} Tonnes</span>
          </div>
        </div>

        {/* Minimum Price */}
        <div id="min-price-metric" className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-1">
            <span>Minimum Price</span>
            <span className="text-[10px] text-stone-500">Floor Level</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold text-stone-800 tracking-tight">
              ₹{minDisplay.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500 font-medium">{unitLabel}</span>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center justify-between mt-1 pt-1 border-t border-stone-200">
            <span>Spread to Modal</span>
            <span className="font-medium text-stone-700">-₹{Math.round(modalDisplay - minDisplay).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Maximum Price */}
        <div id="max-price-metric" className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-1">
            <span>Maximum / Premium Price</span>
            <span className="text-[10px] text-stone-500">Grade-A Ceiling</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold text-stone-800 tracking-tight">
              ₹{maxDisplay.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500 font-medium">{unitLabel}</span>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center justify-between mt-1 pt-1 border-t border-stone-200">
            <span>Spread to Modal</span>
            <span className="font-medium text-emerald-700">+₹{Math.round(maxDisplay - modalDisplay).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Source & Freshness Badge as per prompt specification:
          "Every price shown must display its source and freshness: '₹1,240/quintal · Vijayawada Mandi · Updated 2 hrs ago.'" */}
      <div id="price-source-freshness-bar" className="bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-stone-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="tracking-tight">{data.freshness.sourceTag}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            Arrival date: {data.freshness.formattedDate}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
            isCache ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {isCache ? '6h Cache Hit' : 'Live Sync'}
          </span>
        </div>
      </div>
    </div>
  );
};
