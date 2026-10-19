import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Layers, Activity } from 'lucide-react';
import { TrendDataPoint } from '../types';

interface TrendChartProps {
  history7d: TrendDataPoint[];
  history30d: TrendDataPoint[];
  currentModalPrice: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ history7d, history30d, currentModalPrice }) => {
  const [viewWindow, setViewWindow] = useState<'7d' | '30d'>('7d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dataset = viewWindow === '7d' ? history7d : history30d;
  if (!dataset || dataset.length === 0) return null;

  // Compute boundaries
  const prices = dataset.map(d => d.modalPrice);
  const minPrice = Math.min(...dataset.map(d => d.minPrice));
  const maxPrice = Math.max(...dataset.map(d => d.maxPrice));
  const priceRange = Math.max(10, maxPrice - minPrice);

  const volumes = dataset.map(d => d.arrivalVolumeTonnes);
  const maxVolume = Math.max(...volumes, 10);

  const startPrice = dataset[0]?.modalPrice || currentModalPrice;
  const endPrice = dataset[dataset.length - 1]?.modalPrice || currentModalPrice;
  const diffPct = Math.round(((endPrice - startPrice) / startPrice) * 1000) / 10;
  const isPositive = diffPct >= 0;

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 180;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 35;
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const points = dataset.map((d, i) => {
    const x = padLeft + (i / (dataset.length - 1)) * chartWidth;
    const norm = (d.modalPrice - minPrice) / priceRange;
    const y = padTop + chartHeight - norm * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + chartHeight} L ${points[0].x},${padTop + chartHeight} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div id="trend-chart-card" className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
      {/* Header with period toggle and metric summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
            <Activity className="w-4 h-4 text-emerald-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              Historical Price & Arrival Volume Trend
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? `+${diffPct}%` : `${diffPct}%`}
              </span>
            </h3>
            <p className="text-[11px] text-stone-500">
              {viewWindow === '7d' ? 'Last 7 days daily mandi modal prices' : 'Last 30 days price trajectory & supply volume'}
            </p>
          </div>
        </div>

        {/* 7-day vs 30-day toggle */}
        <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            id="trend-toggle-7d"
            onClick={() => {
              setViewWindow('7d');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-md transition ${
              viewWindow === '7d' ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            id="trend-toggle-30d"
            onClick={() => {
              setViewWindow('30d');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-md transition ${
              viewWindow === '30d' ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Interactive Tooltip Bar */}
      {activePoint && (
        <div className="mb-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">{activePoint.data.date} ({activePoint.data.dayLabel})</span>
            <span className="text-stone-400">|</span>
            <span className="font-bold text-emerald-800 text-sm">
              ₹{activePoint.data.modalPrice.toLocaleString('en-IN')}/qtl
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-600 text-[11px]">
            <span>Min: ₹{activePoint.data.minPrice}</span>
            <span>Max: ₹{activePoint.data.maxPrice}</span>
            <span className="font-medium text-stone-800">
              Arrivals: {activePoint.data.arrivalVolumeTonnes} Tonnes
            </span>
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 select-none"
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#047857" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={svgWidth - padRight}
            y2={padTop}
            stroke="#e7e5e4"
            strokeDasharray="3 3"
          />
          <line
            x1={padLeft}
            y1={padTop + chartHeight / 2}
            x2={svgWidth - padRight}
            y2={padTop + chartHeight / 2}
            stroke="#e7e5e4"
            strokeDasharray="3 3"
          />
          <line
            x1={padLeft}
            y1={padTop + chartHeight}
            x2={svgWidth - padRight}
            y2={padTop + chartHeight}
            stroke="#d6d3d1"
          />

          {/* Y-axis labels */}
          <text x={padLeft - 6} y={padTop + 4} textAnchor="end" fontSize="10" fill="#78716c" fontWeight="500">
            ₹{maxPrice}
          </text>
          <text x={padLeft - 6} y={padTop + chartHeight / 2 + 3} textAnchor="end" fontSize="10" fill="#78716c">
            ₹{Math.round((maxPrice + minPrice) / 2)}
          </text>
          <text x={padLeft - 6} y={padTop + chartHeight + 3} textAnchor="end" fontSize="10" fill="#78716c" fontWeight="500">
            ₹{minPrice}
          </text>

          {/* Daily arrival volume bars (background subtle bars) */}
          {dataset.map((d, i) => {
            const barWidth = Math.max(3, chartWidth / dataset.length - (viewWindow === '7d' ? 12 : 3));
            const x = padLeft + (i / (dataset.length - 1)) * chartWidth - barWidth / 2;
            const barHeight = (d.arrivalVolumeTonnes / maxVolume) * (chartHeight * 0.35);
            const y = padTop + chartHeight - barHeight;
            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#cbd5e1"
                opacity="0.45"
                rx="1"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Main Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#047857"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover interactive vertical line */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={padTop}
              x2={points[hoveredIndex].x}
              y2={padTop + chartHeight}
              stroke="#047857"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            const isLast = i === points.length - 1;
            return (
              <g
                key={`pt-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <rect
                  x={pt.x - chartWidth / dataset.length / 2}
                  y={padTop}
                  width={chartWidth / dataset.length}
                  height={chartHeight + padBottom}
                  fill="transparent"
                />
                {(isHovered || isLast || viewWindow === '7d') && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : isLast ? 4 : 3}
                    fill={isHovered ? '#047857' : '#ffffff'}
                    stroke="#047857"
                    strokeWidth={isHovered ? 2.5 : 2}
                  />
                )}
              </g>
            );
          })}

          {/* X-axis date labels */}
          {points
            .filter((_, idx) => {
              if (viewWindow === '7d') return true;
              return idx % 6 === 0 || idx === points.length - 1;
            })
            .map((pt, i) => (
              <text
                key={`label-${i}`}
                x={pt.x}
                y={padTop + chartHeight + 16}
                textAnchor="middle"
                fontSize="9.5"
                fill="#78716c"
                fontWeight="500"
              >
                {pt.data.dayLabel}
              </text>
            ))}
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-700 rounded-full inline-block"></span>
          Modal Agmarknet Price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 bg-slate-300 rounded inline-block"></span>
          Mandi Arrival Volumes (Tonnes)
        </span>
      </div>
    </div>
  );
};
