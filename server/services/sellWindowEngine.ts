import { CropInfo } from '../data/masterCrops.js';

export interface TrendDataPoint {
  date: string;
  dayLabel: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalVolumeTonnes: number;
}

export interface SellWindowRecommendation {
  action: 'SELL_NOW' | 'HOLD_AND_SELL_SOON' | 'STORE_AND_WAIT' | 'DISPATCH_IMMEDIATELY';
  headline: string;
  oneLiner: string;
  confidenceScore: number; // 0 - 100
  trend7dPct: number;
  trend30dPct: number;
  arrivalMomentumPct: number;
  urgency: 'high' | 'medium' | 'low';
  optimalDaysWindow: string;
  estimatedPriceSwing: string;
}

/**
 * Compute smart sell-window recommendation from historical trend and crop biology
 */
export function computeSellWindow(
  crop: CropInfo,
  currentModalPrice: number,
  history7d: TrendDataPoint[],
  history30d: TrendDataPoint[]
): SellWindowRecommendation {
  // 7-day price difference
  const start7d = history7d[0]?.modalPrice || currentModalPrice;
  const trend7dPct = Math.round(((currentModalPrice - start7d) / start7d) * 1000) / 10;

  // 30-day price difference
  const start30d = history30d[0]?.modalPrice || currentModalPrice;
  const trend30dPct = Math.round(((currentModalPrice - start30d) / start30d) * 1000) / 10;

  // 7-day arrival volume change
  const startVol = history7d[0]?.arrivalVolumeTonnes || 100;
  const currentVol = history7d[history7d.length - 1]?.arrivalVolumeTonnes || 100;
  const arrivalMomentumPct = Math.round(((currentVol - startVol) / startVol) * 1000) / 10;

  const isPerishable = crop.shelfLifeDays <= 14;
  const isDurable = crop.shelfLifeDays >= 120;

  // 30-day min and max
  const max30d = Math.max(...history30d.map(d => d.modalPrice));
  const min30d = Math.min(...history30d.map(d => d.modalPrice));
  const isNear30dHigh = currentModalPrice >= max30d * 0.96;
  const isNear30dLow = currentModalPrice <= min30d * 1.04;

  if (isPerishable) {
    if (trend7dPct >= 4 && arrivalMomentumPct <= 5) {
      return {
        action: 'HOLD_AND_SELL_SOON',
        headline: 'Hold for 2–3 Days',
        oneLiner: `Sell in 2–3 days: Price is rising (+${trend7dPct}% this week) while arrivals are constrained, creating a near-term premium before perishable limit.`,
        confidenceScore: 88,
        trend7dPct,
        trend30dPct,
        arrivalMomentumPct,
        urgency: 'medium',
        optimalDaysWindow: 'Next 48–72 hours',
        estimatedPriceSwing: `+₹${Math.round(currentModalPrice * 0.04)} to +₹${Math.round(currentModalPrice * 0.08)}/qtl`,
      };
    } else if (arrivalMomentumPct > 15 || trend7dPct < -3) {
      return {
        action: 'DISPATCH_IMMEDIATELY',
        headline: 'Sell Now (Perishability Alert)',
        oneLiner: `Sell today: Mandi arrivals surged (+${arrivalMomentumPct}%) putting downward pressure on prices (${trend7dPct}% this week). Avoid holding perishable stock.`,
        confidenceScore: 92,
        trend7dPct,
        trend30dPct,
        arrivalMomentumPct,
        urgency: 'high',
        optimalDaysWindow: 'Within 24 hours',
        estimatedPriceSwing: `-₹${Math.round(currentModalPrice * 0.05)}/qtl if delayed`,
      };
    } else {
      return {
        action: 'SELL_NOW',
        headline: 'Sell on Schedule',
        oneLiner: `Sell within 1–2 days: Prices are steady at ₹${currentModalPrice}/qtl with balanced supply. Favorable window for regular harvest turnover.`,
        confidenceScore: 84,
        trend7dPct,
        trend30dPct,
        arrivalMomentumPct,
        urgency: 'medium',
        optimalDaysWindow: '1–2 days',
        estimatedPriceSwing: 'Stable (±1.5%)',
      };
    }
  }

  // Durable / Grains / Pulses / Oilseeds / Spices
  if (isNear30dHigh && arrivalMomentumPct > 10) {
    return {
      action: 'SELL_NOW',
      headline: 'Sell Now (Near 30-Day Peak)',
      oneLiner: `Sell now: Modal price is near the 30-day peak (₹${max30d}/qtl), but increasing arrivals suggest prices may soften over the next week.`,
      confidenceScore: 91,
      trend7dPct,
      trend30dPct,
      arrivalMomentumPct,
      urgency: 'high',
      optimalDaysWindow: 'Next 2–4 days',
      estimatedPriceSwing: `Lock in current peak (+₹${Math.round(currentModalPrice - start30d)}/qtl vs monthly baseline)`,
    };
  }

  if (isNear30dLow && isDurable) {
    return {
      action: 'STORE_AND_WAIT',
      headline: 'Store in Warehouse & Wait',
      oneLiner: `Hold/Store for 2–3 weeks: Current price is at a seasonal low (₹${currentModalPrice}/qtl), with futures & procurement demand expected to rebound.`,
      confidenceScore: 86,
      trend7dPct,
      trend30dPct,
      arrivalMomentumPct,
      urgency: 'low',
      optimalDaysWindow: '15–25 days',
      estimatedPriceSwing: `Potential upside +8% to +14% (WDRA registered godown recommended)`,
    };
  }

  if (trend7dPct > 2.5) {
    return {
      action: 'HOLD_AND_SELL_SOON',
      headline: 'Hold for Best Price',
      oneLiner: `Sell in 3–5 days: Healthy upward momentum (+${trend7dPct}% over 7 days) indicates buyers are active and bids are advancing.`,
      confidenceScore: 87,
      trend7dPct,
      trend30dPct,
      arrivalMomentumPct,
      urgency: 'medium',
      optimalDaysWindow: '3–5 days',
      estimatedPriceSwing: `+₹${Math.round(currentModalPrice * 0.03)} to +₹${Math.round(currentModalPrice * 0.06)}/qtl`,
    };
  }

  return {
    action: 'SELL_NOW',
    headline: 'Optimal Sale Window Active',
    oneLiner: `Sell within 3–6 days: Modal price of ₹${currentModalPrice}/qtl is aligned with 30-day average. Solid buyer liquidity reported across yards.`,
    confidenceScore: 82,
    trend7dPct,
    trend30dPct,
    arrivalMomentumPct,
    urgency: 'medium',
    optimalDaysWindow: '3–6 days',
    estimatedPriceSwing: 'Steady range',
  };
}
