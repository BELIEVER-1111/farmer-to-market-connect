import React from 'react';
import { Sparkles, Compass, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { SellWindowRecommendation } from '../types';

interface SellWindowCardProps {
  recommendation: SellWindowRecommendation;
  commodityName: string;
}

export const SellWindowCard: React.FC<SellWindowCardProps> = ({ recommendation, commodityName }) => {
  const getActionColor = () => {
    switch (recommendation.action) {
      case 'SELL_NOW':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          badgeBg: 'bg-emerald-700 text-white',
          text: 'text-emerald-950',
          icon: <CheckCircle className="w-4 h-4 text-emerald-700" />,
        };
      case 'HOLD_AND_SELL_SOON':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          badgeBg: 'bg-amber-600 text-white',
          text: 'text-amber-950',
          icon: <Clock className="w-4 h-4 text-amber-700" />,
        };
      case 'DISPATCH_IMMEDIATELY':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          badgeBg: 'bg-rose-600 text-white',
          text: 'text-rose-950',
          icon: <AlertTriangle className="w-4 h-4 text-rose-700" />,
        };
      case 'STORE_AND_WAIT':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          badgeBg: 'bg-blue-600 text-white',
          text: 'text-blue-950',
          icon: <Compass className="w-4 h-4 text-blue-700" />,
        };
    }
  };

  const style = getActionColor();

  return (
    <div
      id="sell-window-recommendation-card"
      className={`${style.bg} border ${style.border} rounded-xl p-4 shadow-xs relative overflow-hidden transition`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-white border border-stone-200 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-800" />
          </div>
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Sell Window Intelligence
          </span>
        </div>

        {/* Action Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs ${style.badgeBg}`}>
            {recommendation.headline}
          </span>
          <span className="text-[11px] font-medium text-stone-500">
            Window: <strong className="text-stone-800">{recommendation.optimalDaysWindow}</strong>
          </span>
        </div>
      </div>

      {/* Primary One-Line Recommendation as requested in prompt:
          "One-line Sell Window recommendation computed from that trend" */}
      <div id="sell-window-oneliner" className="p-3 bg-white/90 border border-stone-200/80 rounded-lg shadow-2xs mb-3">
        <p className="text-sm font-semibold text-stone-900 leading-snug">
          {recommendation.oneLiner}
        </p>
      </div>

      {/* Factor breakdown chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-white/70 border border-stone-200/60 rounded-md p-2">
          <span className="text-[10px] text-stone-500 block">7-Day Momentum</span>
          <span className={`font-bold ${recommendation.trend7dPct >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {recommendation.trend7dPct >= 0 ? `+${recommendation.trend7dPct}%` : `${recommendation.trend7dPct}%`}
          </span>
        </div>

        <div className="bg-white/70 border border-stone-200/60 rounded-md p-2">
          <span className="text-[10px] text-stone-500 block">Mandi Arrivals Shift</span>
          <span className={`font-bold ${recommendation.arrivalMomentumPct > 10 ? 'text-amber-700' : 'text-stone-800'}`}>
            {recommendation.arrivalMomentumPct >= 0 ? `+${recommendation.arrivalMomentumPct}% supply` : `${recommendation.arrivalMomentumPct}% supply`}
          </span>
        </div>

        <div className="bg-white/70 border border-stone-200/60 rounded-md p-2">
          <span className="text-[10px] text-stone-500 block">Projected Swing</span>
          <span className="font-semibold text-stone-800 text-[11px]">
            {recommendation.estimatedPriceSwing}
          </span>
        </div>

        <div className="bg-white/70 border border-stone-200/60 rounded-md p-2">
          <span className="text-[10px] text-stone-500 block">Model Confidence</span>
          <span className="font-bold text-emerald-800">
            {recommendation.confidenceScore}% reliable
          </span>
        </div>
      </div>
    </div>
  );
};
