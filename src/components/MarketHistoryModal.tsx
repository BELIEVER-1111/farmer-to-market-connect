import React, { useState } from 'react';
import { History, TrendingUp, Calendar, Layers, BarChart3, ArrowDownRight, ArrowUpRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { generateMarketHistory } from '../services/farmerLotsService';
import { MonthlyHistoryRecord } from '../types';

interface MarketHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCrop?: string;
}

export const MarketHistoryModal: React.FC<MarketHistoryModalProps> = ({
  isOpen,
  onClose,
  defaultCrop = 'Tomato',
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(defaultCrop);
  const [historyRecords, setHistoryRecords] = useState<MonthlyHistoryRecord[]>(() =>
    generateMarketHistory(defaultCrop, defaultCrop === 'Cotton' ? 6800 : defaultCrop === 'Wheat' ? 2450 : 1250)
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const CROP_BENCHMARKS: Record<string, number> = {
    'Rice (Dhan)': 2480,
    'Wheat': 2520,
    'Maize': 2180,
    'Jowar': 3250,
    'Bajra': 2520,
    'Ragi': 4350,
    'Chana (Gram)': 5950,
    'Arhar (Tur)': 10400,
    'Moong': 8850,
    'Masoor': 6850,
    'Sugarcane': 365,
    'Cotton': 7650,
    'Jute': 5680,
    'Mustard': 5850,
    'Soyabean': 4720,
    'Groundnut': 6780,
    'Sunflower': 6650,
    'Watermelon': 1350,
    'Cucumber': 1680,
    'Tomato': 1650,
    'Onion': 2150,
    'Potato': 1380,
    'Green Chilli': 4100,
  };

  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    const base = CROP_BENCHMARKS[crop] || 2200;
    setHistoryRecords(generateMarketHistory(crop, base));
    setHoveredIdx(null);
  };

  // Compute scale boundaries
  const prices = historyRecords.map(r => r.avgModalPrice);
  const minPrice = Math.min(...historyRecords.map(r => r.minPrice));
  const maxPrice = Math.max(...historyRecords.map(r => r.maxPrice));
  const priceRange = Math.max(100, maxPrice - minPrice);

  const volumes = historyRecords.map(r => r.totalArrivalTonnes);
  const maxVolume = Math.max(...volumes, 100);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 40;
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const points = historyRecords.map((d, i) => {
    const x = padLeft + (i / (historyRecords.length - 1)) * chartWidth;
    const norm = (d.avgModalPrice - minPrice) / priceRange;
    const y = padTop + chartHeight - norm * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + chartHeight} L ${points[0].x},${padTop + chartHeight} Z`;

  const activeRecord = hoveredIdx !== null ? points[hoveredIdx].data : points[points.length - 1].data;

  // Best season to sell calculation
  const highestMonth = [...historyRecords].sort((a, b) => b.avgModalPrice - a.avgModalPrice)[0];
  const lowestMonth = [...historyRecords].sort((a, b) => a.avgModalPrice - b.avgModalPrice)[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Mandi Market History &amp; 12-Month Seasonal Graphical Representation
              </h3>
              <p className="text-xs text-stone-300">
                Historical monthly price spread, seasonal crop cycles &amp; arrival volume pressure
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Commodity Selector Bar */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700 uppercase tracking-wider">
              Select Crop (Cereals, Pulses, Commercial, Oilseeds, Seasonal):
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              Oct 2025 – Sep 2026 Historical Records
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
            {Object.keys(CROP_BENCHMARKS).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => handleCropChange(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCrop === c
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Top Key Insights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-stone-500 block text-[11px]">Peak Price Month</span>
              <strong className="text-sm text-emerald-900 block mt-0.5">
                {highestMonth.month} ({highestMonth.seasonName})
              </strong>
              <span className="text-[11px] text-emerald-700 font-medium">
                Avg: ₹{highestMonth.avgModalPrice}/qtl (+{Math.round(((highestMonth.avgModalPrice - lowestMonth.avgModalPrice) / lowestMonth.avgModalPrice) * 100)}% over annual low)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="text-stone-500 block text-[11px]">Glut Season (Lowest Price)</span>
              <strong className="text-sm text-amber-900 block mt-0.5">
                {lowestMonth.month} ({lowestMonth.seasonName})
              </strong>
              <span className="text-[11px] text-amber-700 font-medium">
                Avg: ₹{lowestMonth.avgModalPrice}/qtl · High arrivals of {lowestMonth.totalArrivalTonnes} Tonnes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <span className="text-stone-500 block text-[11px]">Current Selected Month</span>
              <strong className="text-sm text-stone-900 block mt-0.5">
                {activeRecord.month} · ₹{activeRecord.avgModalPrice}/qtl
              </strong>
              <span className="text-[11px] text-stone-600 font-medium">
                Min: ₹{activeRecord.minPrice} · Max: ₹{activeRecord.maxPrice} · Arrivals: {activeRecord.totalArrivalTonnes}T
              </span>
            </div>
          </div>

          {/* SVG Graphical Representation */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-800" />
                12-Month Modal Price (Line) &amp; Total Arrival Volume (Bars)
              </span>
              <span className="text-[11px] text-stone-500">
                Hover over data points to inspect monthly spread
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none">
                <defs>
                  <linearGradient id="historyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#047857" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1={padLeft} y1={padTop} x2={svgWidth - padRight} y2={padTop} stroke="#e7e5e4" strokeDasharray="3 3" />
                <line x1={padLeft} y1={padTop + chartHeight / 2} x2={svgWidth - padRight} y2={padTop + chartHeight / 2} stroke="#e7e5e4" strokeDasharray="3 3" />
                <line x1={padLeft} y1={padTop + chartHeight} x2={svgWidth - padRight} y2={padTop + chartHeight} stroke="#d6d3d1" />

                {/* Y-axis labels */}
                <text x={padLeft - 6} y={padTop + 4} textAnchor="end" fontSize="10" fill="#78716c" fontWeight="bold">
                  ₹{maxPrice}
                </text>
                <text x={padLeft - 6} y={padTop + chartHeight / 2 + 3} textAnchor="end" fontSize="10" fill="#78716c">
                  ₹{Math.round((maxPrice + minPrice) / 2)}
                </text>
                <text x={padLeft - 6} y={padTop + chartHeight + 3} textAnchor="end" fontSize="10" fill="#78716c" fontWeight="bold">
                  ₹{minPrice}
                </text>

                {/* Arrival Volume Bars (Seasonality indicator) */}
                {historyRecords.map((d, i) => {
                  const barWidth = 24;
                  const x = padLeft + (i / (historyRecords.length - 1)) * chartWidth - barWidth / 2;
                  const barHeight = (d.totalArrivalTonnes / maxVolume) * (chartHeight * 0.4);
                  const y = padTop + chartHeight - barHeight;
                  const isHovered = hoveredIdx === i;

                  return (
                    <rect
                      key={`hist-vol-${i}`}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={d.seasonName === 'Kharif' ? '#a7f3d0' : d.seasonName === 'Rabi' ? '#fed7aa' : '#e2e8f0'}
                      opacity={isHovered ? 0.9 : 0.6}
                      rx="2"
                    />
                  );
                })}

                {/* Shaded area */}
                <path d={areaD} fill="url(#historyGrad)" />

                {/* Modal Price Line */}
                <path d={pathD} fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points */}
                {points.map((pt, i) => {
                  const isHovered = hoveredIdx === i;
                  return (
                    <g key={`hist-pt-${i}`} onMouseEnter={() => setHoveredIdx(i)} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? '#047857' : '#ffffff'}
                        stroke="#047857"
                        strokeWidth={isHovered ? 3 : 2}
                      />
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {points.map((pt, i) => (
                  <text
                    key={`hist-x-${i}`}
                    x={pt.x}
                    y={padTop + chartHeight + 18}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#57534e"
                    fontWeight="500"
                  >
                    {pt.data.month.split(' ')[0]}
                  </text>
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100 mt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-700 rounded-full inline-block"></span>
                  Monthly Modal Price
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2 bg-emerald-200 rounded inline-block"></span>
                  Kharif Arrivals
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2 bg-amber-200 rounded inline-block"></span>
                  Rabi Arrivals
                </span>
              </div>
              <span>Volume measured in metric tonnes</span>
            </div>
          </div>

          {/* 12-Month Tabular Grid */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3">Season</th>
                  <th className="py-2 px-3">Avg Modal Price</th>
                  <th className="py-2 px-3">Min / Max Range</th>
                  <th className="py-2 px-3 text-right">Mandi Arrivals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {historyRecords.map((r, i) => (
                  <tr
                    key={r.month}
                    className={`transition hover:bg-stone-50 ${hoveredIdx === i ? 'bg-emerald-50/50' : ''}`}
                    onMouseEnter={() => setHoveredIdx(i)}
                  >
                    <td className="py-2 px-3 font-semibold text-stone-900">{r.month}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.seasonName === 'Kharif' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.seasonName}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-stone-900">
                      ₹{r.avgModalPrice.toLocaleString('en-IN')}/qtl
                    </td>
                    <td className="py-2 px-3 text-stone-600">
                      ₹{r.minPrice} – ₹{r.maxPrice}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-stone-800">
                      {r.totalArrivalTonnes} Tonnes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-500">Source: Historical APMC Mandi Gazette &amp; Agmarknet Data Node</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
