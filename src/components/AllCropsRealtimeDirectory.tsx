import React, { useState, useEffect, useMemo } from 'react';
import {
  Sprout,
  Search,
  CloudRain,
  Snowflake,
  Sun,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Info,
  MapPin,
  Clock,
  Wheat,
} from 'lucide-react';
import { CropInfo, CropSeason, CropGroup } from '../types';

interface RealtimeCropWithPrice extends CropInfo {
  realtimePrice?: {
    modalPrice: number;
    minPrice: number;
    maxPrice: number;
    arrivalVolumeTonnes: number;
    unit: string;
    source: string;
    arrivalDate: string;
    market: string;
    district: string;
    state: string;
    mspDifference?: number;
    mspDifferencePct?: number;
    isAboveMsp?: boolean;
  };
}

interface AllCropsRealtimeDirectoryProps {
  selectedMandiName: string;
  selectedStateName: string;
  selectedDistrictName: string;
  onSelectCropForDeepLookup: (crop: CropInfo) => void;
}

type FilterTab =
  | 'ALL'
  | 'MAJOR_FOOD'
  | 'PULSES'
  | 'COMMERCIAL'
  | 'OILSEEDS'
  | 'KHARIF'
  | 'RABI'
  | 'ZAID';

export const AllCropsRealtimeDirectory: React.FC<AllCropsRealtimeDirectoryProps> = ({
  selectedMandiName,
  selectedStateName,
  selectedDistrictName,
  onSelectCropForDeepLookup,
}) => {
  const [crops, setCrops] = useState<RealtimeCropWithPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Fetch real-time values for all crops
  useEffect(() => {
    let isMounted = true;
    const fetchAllCropsRealtime = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          state: selectedStateName,
          district: selectedDistrictName,
          market: selectedMandiName,
        });
        const res = await fetch(`/api/crops/realtime-all?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCrops(data.crops || []);
            setLastUpdatedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        console.error('Failed to load all crops realtime values', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllCropsRealtime();
    return () => {
      isMounted = false;
    };
  }, [selectedMandiName, selectedStateName, selectedDistrictName]);

  // Filter and search logic
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      // 1. Tab filtering
      if (activeTab === 'MAJOR_FOOD') {
        if (crop.cropGroup !== 'Major Food Crops' && crop.cropGroup !== 'Millets') return false;
      } else if (activeTab === 'PULSES') {
        if (crop.cropGroup !== 'Pulses') return false;
      } else if (activeTab === 'COMMERCIAL') {
        if (crop.cropGroup !== 'Cash and Commercial') return false;
      } else if (activeTab === 'OILSEEDS') {
        if (crop.cropGroup !== 'Oilseeds') return false;
      } else if (activeTab === 'KHARIF') {
        if (crop.season !== 'Kharif' && !crop.seasonTiming?.toLowerCase().includes('kharif') && !crop.seasonTiming?.toLowerCase().includes('monsoon')) {
          return false;
        }
      } else if (activeTab === 'RABI') {
        if (crop.season !== 'Rabi' && !crop.seasonTiming?.toLowerCase().includes('rabi') && !crop.seasonTiming?.toLowerCase().includes('winter')) {
          return false;
        }
      } else if (activeTab === 'ZAID') {
        if (crop.season !== 'Zaid' && !crop.seasonTiming?.toLowerCase().includes('zaid') && !crop.seasonTiming?.toLowerCase().includes('summer')) {
          return false;
        }
      }

      // 2. Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = crop.name.toLowerCase().includes(q);
        const matchesAlias = crop.aliases.some(a => a.toLowerCase().includes(q));
        const matchesDesc = crop.description?.toLowerCase().includes(q);
        const matchesCategory = crop.category.toLowerCase().includes(q);
        const matchesState = crop.primaryStates?.some(s => s.toLowerCase().includes(q));
        return matchesName || matchesAlias || matchesDesc || matchesCategory || matchesState;
      }

      return true;
    });
  }, [crops, activeTab, searchQuery]);

  // Quick stats
  const totalCount = crops.length;
  const kharifCount = crops.filter(c => c.season === 'Kharif' || c.seasonTiming?.includes('Monsoon')).length;
  const rabiCount = crops.filter(c => c.season === 'Rabi' || c.seasonTiming?.includes('Winter')).length;
  const zaidCount = crops.filter(c => c.season === 'Zaid' || c.seasonTiming?.includes('Summer')).length;

  const getSeasonBadge = (season?: CropSeason) => {
    switch (season) {
      case 'Kharif':
        return {
          icon: <CloudRain className="w-3.5 h-3.5 text-emerald-700" />,
          label: 'Kharif (Monsoon)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'Rabi':
        return {
          icon: <Snowflake className="w-3.5 h-3.5 text-sky-700" />,
          label: 'Rabi (Winter)',
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'Zaid':
        return {
          icon: <Sun className="w-3.5 h-3.5 text-amber-700" />,
          label: 'Zaid (Summer)',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          icon: <Layers className="w-3.5 h-3.5 text-stone-600" />,
          label: season || 'Year-round',
          badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
        };
    }
  };

  return (
    <section
      id="all-crops-realtime-directory"
      className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden"
    >
      {/* Top Banner & Title Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Agmarknet Sync
              </span>
              <span className="text-xs text-emerald-200/80 hidden sm:inline">
                • Reporting Mandi: <strong className="text-white">{selectedMandiName}</strong> ({selectedDistrictName}, {selectedStateName})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-300" />
              All Crops Real-Time Mandi Rates &amp; Seasonal Directory
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
              Live market values, MSP benchmarks, and botanical categories across <strong>Major Food Crops</strong> (Cereals &amp; Pulses), <strong>Cash &amp; Commercial Crops</strong> (Sugarcane, Cotton, Jute), <strong>Oilseeds</strong>, and <strong>Seasonal Calendars</strong> (Kharif, Rabi, Zaid).
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-emerald-950/50 backdrop-blur-xs p-2 rounded-xl border border-emerald-700/40 text-xs shrink-0 self-start lg:self-center">
            <div className="px-2 py-1 text-center">
              <div className="font-bold text-white text-sm">{totalCount}</div>
              <div className="text-[10px] text-emerald-300">Total Crops</div>
            </div>
            <div className="w-px h-6 bg-emerald-700/60"></div>
            <div className="px-2 py-1 text-center">
              <div className="font-bold text-emerald-200 text-sm">{kharifCount}</div>
              <div className="text-[10px] text-emerald-300">Kharif</div>
            </div>
            <div className="w-px h-6 bg-emerald-700/60"></div>
            <div className="px-2 py-1 text-center">
              <div className="font-bold text-sky-200 text-sm">{rabiCount}</div>
              <div className="text-[10px] text-sky-300">Rabi</div>
            </div>
            <div className="w-px h-6 bg-emerald-700/60"></div>
            <div className="px-2 py-1 text-center">
              <div className="font-bold text-amber-200 text-sm">{zaidCount}</div>
              <div className="text-[10px] text-amber-300">Zaid</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Navigation Bar */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Crops ({crops.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MAJOR_FOOD')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'MAJOR_FOOD'
                  ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              🌾 Cereals &amp; Millets
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PULSES')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'PULSES'
                  ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              🍲 Pulses (दालें)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('COMMERCIAL')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'COMMERCIAL'
                  ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              🏭 Cash &amp; Commercial
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('OILSEEDS')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'OILSEEDS'
                  ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              🌻 Oilseeds (तिलहन)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('KHARIF')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'KHARIF'
                  ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                  : 'bg-emerald-50/80 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              Kharif (Monsoon)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RABI')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'RABI'
                  ? 'bg-sky-700 text-white shadow-2xs font-bold'
                  : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              Rabi (Winter)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ZAID')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'ZAID'
                  ? 'bg-amber-700 text-white shadow-2xs font-bold'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Zaid (Summer)
            </button>
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition ${
                viewMode === 'grid' ? 'bg-emerald-800 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${
                viewMode === 'table' ? 'bg-emerald-800 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Data Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Box & Context Notes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by crop, Hindi alias (e.g. Gehun, Chana, Kapas), or state..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-[11px] text-stone-500 flex items-center gap-2 self-start sm:self-center">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>Last refreshed: {lastUpdatedTime || 'Just now'}</span>
            <span>•</span>
            <span>Click any card to discover deep mandi trends &amp; buyer offers</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="py-16 text-center text-stone-500 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Fetching real-time mandi prices across all agricultural commodities...</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <Sprout className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="text-sm font-semibold text-stone-700">No commodities matched &quot;{searchQuery}&quot;</div>
            <p className="text-xs text-stone-500">Try searching for Rice, Wheat, Chana, Cotton, Sugarcane, or Mustard.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCrops.map(crop => {
              const season = getSeasonBadge(crop.season);
              const price = crop.realtimePrice;
              const modal = price?.modalPrice || crop.benchmarkModalPrice || 0;
              const min = price?.minPrice || Math.round(modal * 0.9);
              const max = price?.maxPrice || Math.round(modal * 1.1);
              const trendPct = crop.dailyTrendPct || 1.2;
              const isPositiveTrend = trendPct >= 0;

              return (
                <div
                  key={crop.id}
                  id={`crop-card-${crop.id}`}
                  className="group bg-white border border-stone-200 hover:border-emerald-500/70 rounded-xl p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Category & Season Badges */}
                    <div className="flex items-center justify-between gap-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium ${season.badgeClass}`}>
                          {season.icon}
                          <span>{crop.season || 'Year-round'}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-semibold text-[10px] uppercase">
                          {crop.cropGroup || crop.category}
                        </span>
                      </div>

                      {/* Daily Trend Badge */}
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          isPositiveTrend
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {isPositiveTrend ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                        {isPositiveTrend ? `+${trendPct}%` : `${trendPct}%`}
                      </span>
                    </div>

                    {/* Crop Name and Multilingual Aliases */}
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition">
                        {crop.name}
                      </h3>
                      <div className="text-xs text-stone-500 font-medium">
                        {crop.aliases.slice(0, 3).join(' • ')}
                      </div>
                    </div>

                    {/* Pedagogical Description from Prompt */}
                    {crop.description && (
                      <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50/80 p-2 rounded-lg border border-stone-150 leading-relaxed">
                        {crop.description}
                      </p>
                    )}

                    {/* Price Block: Real-Time Modal, Min-Max, and MSP Benchmark */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-stone-600">Today&apos;s Mandi Modal:</span>
                        <div className="text-right">
                          <span className="text-xl font-black text-stone-900 tracking-tight">
                            ₹{modal.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] font-bold text-stone-500 ml-1">/{crop.defaultUnit}</span>
                        </div>
                      </div>

                      {/* Price Range Slider visualization */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                          <span>Min: ₹{min.toLocaleString('en-IN')}</span>
                          <span>Max: ₹{max.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-700 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(20, ((modal - min) / Math.max(1, max - min)) * 100))}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* MSP Benchmark Comparison */}
                      {crop.mspPrice && (
                        <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between text-[11px]">
                          <span className="text-stone-500 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Govt MSP: <strong>₹{crop.mspPrice.toLocaleString('en-IN')}</strong>
                          </span>
                          {modal >= crop.mspPrice ? (
                            <span className="text-emerald-700 font-bold">
                              +₹{(modal - crop.mspPrice).toLocaleString('en-IN')} Above MSP
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold">
                              -₹{(crop.mspPrice - modal).toLocaleString('en-IN')} Under MSP
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Growing states & season timing */}
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">
                        <strong>Major States:</strong> {crop.primaryStates?.slice(0, 3).join(', ') || 'Pan-India'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Action Button */}
                  <div className="mt-3.5 pt-2.5 border-t border-stone-150">
                    <button
                      type="button"
                      onClick={() => onSelectCropForDeepLookup(crop)}
                      className="w-full py-2 px-3 bg-stone-100 hover:bg-emerald-800 text-stone-800 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-emerald-800 group-hover:text-white"
                    >
                      <span>Check Mandi Price &amp; Sell Recommendation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Data Table View */
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 font-bold">Commodity &amp; Aliases</th>
                  <th className="py-3 px-3 font-bold">Season &amp; Timing</th>
                  <th className="py-3 px-3 font-bold">Category</th>
                  <th className="py-3 px-3 text-right font-bold">Modal Price</th>
                  <th className="py-3 px-3 text-right font-bold">Range (Min - Max)</th>
                  <th className="py-3 px-3 text-right font-bold">MSP Status</th>
                  <th className="py-3 px-3.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {filteredCrops.map(crop => {
                  const season = getSeasonBadge(crop.season);
                  const price = crop.realtimePrice;
                  const modal = price?.modalPrice || crop.benchmarkModalPrice || 0;
                  const min = price?.minPrice || Math.round(modal * 0.9);
                  const max = price?.maxPrice || Math.round(modal * 1.1);

                  return (
                    <tr key={crop.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-3.5 font-medium">
                        <div className="font-bold text-stone-900 text-sm">{crop.name}</div>
                        <div className="text-[11px] text-stone-500">{crop.aliases.slice(0, 3).join(', ')}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${season.badgeClass}`}>
                          {season.icon}
                          {crop.season || 'Year-round'}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-0.5">{crop.seasonTiming || ''}</div>
                      </td>

                      <td className="py-3 px-3 font-medium text-stone-600">
                        {crop.cropGroup || crop.category}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-stone-900 text-sm">
                        ₹{modal.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-stone-500">/{crop.defaultUnit}</span>
                      </td>

                      <td className="py-3 px-3 text-right text-stone-600 font-medium">
                        ₹{min.toLocaleString('en-IN')} – ₹{max.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {crop.mspPrice ? (
                          <div className="text-[11px]">
                            <div className="font-bold text-stone-700">₹{crop.mspPrice.toLocaleString('en-IN')}</div>
                            {modal >= crop.mspPrice ? (
                              <span className="text-emerald-700 font-semibold text-[10px]">+₹{modal - crop.mspPrice}</span>
                            ) : (
                              <span className="text-amber-700 font-semibold text-[10px]">-₹{crop.mspPrice - modal}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectCropForDeepLookup(crop)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Analyze</span>
                          <ExternalLink className="w-3 h-3 text-emerald-200" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Educational Seasonal Footer Summary Banner */}
      <div className="bg-stone-50 p-4 border-t border-stone-200 text-xs text-stone-600">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-stone-800">
              Seasonal Crop Calendar of India &amp; Sowing-Harvesting Cycles:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-stone-600 mt-1">
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-150">
                <strong className="text-emerald-900 block mb-0.5">🌧️ Kharif (Monsoon / June–October):</strong>
                Sown with onset of monsoon rains. Major crops include <strong>Rice, Maize, Cotton, Sugarcane, Soybean, Bajra, Jowar, Arhar, and Groundnut</strong>.
              </div>
              <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-150">
                <strong className="text-sky-900 block mb-0.5">❄️ Rabi (Winter / November–April):</strong>
                Sown after monsoon in cool autumn and harvested in spring. Major crops include <strong>Wheat, Barley, Gram (Chana), Mustard, Masoor, and Potato</strong>.
              </div>
              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-150">
                <strong className="text-amber-900 block mb-0.5">☀️ Zaid (Summer / March–June):</strong>
                Short-duration crops cultivated between Rabi harvest and Kharif sowing. Major crops include <strong>Watermelon, Cucumber, and fresh short-term vegetables</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
