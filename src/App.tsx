import React, { useState, useEffect, useCallback } from 'react';
import {
  Sprout,
  ShieldCheck,
  Activity,
  SlidersHorizontal,
  FileCheck,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  History,
  Scale,
  User,
  ShieldAlert,
  LogOut,
  Building2,
  ChevronDown,
  Truck,
  Wheat,
} from 'lucide-react';
import { CropInfo, StateHierarchy, CropPriceLookupResult, UserSession } from './types';
import { CropAutocomplete, POPULAR_CROPS } from './components/CropAutocomplete';
import { LocationSelector } from './components/LocationSelector';
import { PriceDisplayCard } from './components/PriceDisplayCard';
import { TrendChart } from './components/TrendChart';
import { SellWindowCard } from './components/SellWindowCard';
import { NearbyMarketsTable } from './components/NearbyMarketsTable';
import { BuyerOffersSection } from './components/BuyerOffersSection';
import { AcceptanceTestModal } from './components/AcceptanceTestModal';
import { AdminMetricsDrawer } from './components/AdminMetricsDrawer';
import { AllCropsRealtimeDirectory } from './components/AllCropsRealtimeDirectory';

// New specialized components for Farmer, Operator, Admin and Market History
import { FarmerAuthModal } from './components/auth/FarmerAuthModal';
import { OperatorAuthModal } from './components/auth/OperatorAuthModal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { MarketHistoryModal } from './components/MarketHistoryModal';
import { ProduceTrackerModal } from './components/tracker/ProduceTrackerModal';
import { getCurrentSession, setSession } from './services/authService';

export default function App() {
  // Authentication & Role Session
  const [session, setCurrentSessionState] = useState<UserSession | null>(() => getCurrentSession());
  const [isFarmerAuthOpen, setIsFarmerAuthOpen] = useState(false);
  const [isOperatorAuthOpen, setIsOperatorAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackerInitialLotId, setTrackerInitialLotId] = useState<string | undefined>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('track') || undefined;
    } catch {
      return undefined;
    }
  });

  // Automatically open tracker if user arrived via WhatsApp link with ?track=
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get('track');
      if (trackId) {
        setTrackerInitialLotId(trackId);
        setIsTrackerModalOpen(true);
      }
    } catch {
      // Ignore URL parse error
    }
  }, []);

  // Active portal tab when logged in ('PORTAL' | 'PRICE_DISCOVERY')
  const [activeTab, setActiveTab] = useState<'PORTAL' | 'PRICE_DISCOVERY'>('PORTAL');

  // Master data states
  const [statesHierarchy, setStatesHierarchy] = useState<StateHierarchy[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null);

  // Location selections
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Krishna');
  const [selectedMarket, setSelectedMarket] = useState<string>('Vijayawada Mandi');
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);

  // Lookup results & loading states
  const [lookupResult, setLookupResult] = useState<CropPriceLookupResult | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals / Drawers
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  // Initial data loading: Load Locations Hierarchy & Default Crop
  useEffect(() => {
    async function init() {
      try {
        const [locRes, cropRes] = await Promise.all([
          fetch('/api/locations/hierarchy'),
          fetch('/api/crops/master'),
        ]);

        if (locRes.ok) {
          const locData = await locRes.json();
          setStatesHierarchy(locData.states || []);
        }

        if (cropRes.ok) {
          const cropData = await cropRes.json();
          const firstCrop = cropData.crops?.[0] || null;
          setSelectedCrop(firstCrop);
        }
      } catch (err) {
        console.error('Failed to initialize lookup service', err);
      }
    }
    init();
  }, []);

  // Trigger real-time price lookup
  const performPriceLookup = useCallback(
    async (cropName: string, state: string, district: string, market: string, lat?: number, lng?: number) => {
      if (!cropName || !market) return;

      setIsLoadingPrice(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams({
          crop: cropName,
          state,
          district,
          market,
        });
        if (lat !== undefined && lng !== undefined) {
          params.append('lat', lat.toString());
          params.append('lng', lng.toString());
        }

        const res = await fetch(`/api/prices/lookup?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Price lookup returned status ${res.status}`);
        }

        const data: CropPriceLookupResult = await res.json();
        setLookupResult(data);
      } catch (err: any) {
        console.error('Error fetching crop price:', err);
        setErrorMsg('Failed to reach Agmarknet price network. Retrying with local cache...');
      } finally {
        setIsLoadingPrice(false);
      }
    },
    []
  );

  // Auto-trigger price lookup whenever crop or location changes
  useEffect(() => {
    if (selectedCrop && selectedMarket) {
      performPriceLookup(selectedCrop.name, selectedState, selectedDistrict, selectedMarket, userLat, userLng);
    }
  }, [selectedCrop, selectedState, selectedDistrict, selectedMarket, performPriceLookup, userLat, userLng]);

  // Handle location update from selector
  const handleLocationChange = (state: string, district: string, market: string, lat?: number, lng?: number) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setSelectedMarket(market);
    if (lat !== undefined && lng !== undefined) {
      setUserLat(lat);
      setUserLng(lng);
    }
  };

  // Handle switching to a nearby market from the comparison table
  const handleSwitchToNearbyMarket = (state: string, district: string, market: string) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setSelectedMarket(market);
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setCurrentSessionState(newSession);
    setSession(newSession);
    setActiveTab('PORTAL');
  };

  const handleLogout = () => {
    setCurrentSessionState(null);
    setSession(null);
    setActiveTab('PRICE_DISCOVERY');
  };

  const handleCropSelectFromDashboard = (cropName: string) => {
    const cropInfo: CropInfo = {
      id: cropName.toLowerCase().replace(/\s+/g, '_'),
      name: cropName,
      category: 'Vegetables',
      aliases: [cropName],
      varieties: ['Desi FAQ', 'Hybrid Prime'],
      defaultUnit: 'Quintal',
      shelfLifeDays: 7,
    };
    setSelectedCrop(cropInfo);
    setActiveTab('PRICE_DISCOVERY');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-stone-900">
                  Farmer To Market Connect
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Agmarknet
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Transparent Real-Time Crop Price Discovery &amp; Direct Market Linkages
              </p>
            </div>
          </div>

          {/* Center/Right Actions: Market History + Role Logins */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* All Crops Real-Time Directory button */}
            <button
              type="button"
              id="open-all-crops-directory-btn"
              onClick={() => {
                setActiveTab('PRICE_DISCOVERY');
                setTimeout(() => {
                  const el = document.getElementById('all-crops-realtime-directory');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <Wheat className="w-3.5 h-3.5 text-emerald-800" />
              <span>All Crops Rates (सभी फसलों के भाव)</span>
            </button>

            {/* Live Produce Lifecycle Tracker button */}
            <button
              type="button"
              id="open-tracker-btn"
              onClick={() => setIsTrackerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Track Produce (ऑर्डर ट्रैक करें)</span>
            </button>

            {/* Market History & Graphical Representation button */}
            <button
              type="button"
              id="open-market-history-btn"
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">Market History &amp; Charts</span>
              <span className="sm:hidden">History</span>
            </button>

            {/* If user is logged in, show active user badge & switch options */}
            {session ? (
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs">
                  {session.role === 'farmer' && <Sprout className="w-3.5 h-3.5 text-emerald-700" />}
                  {session.role === 'operator' && <Scale className="w-3.5 h-3.5 text-amber-700" />}
                  {session.role === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />}
                  <span className="font-bold text-stone-900 truncate max-w-[130px]">{session.name}</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                    {session.role}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'PORTAL' ? 'PRICE_DISCOVERY' : 'PORTAL')}
                    className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    {activeTab === 'PORTAL' ? 'Check Mandi Prices' : 'My Dashboard'}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Three Separate Dedicated Login Buttons */
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. Farmer Login */}
                <button
                  type="button"
                  id="farmer-login-modal-btn"
                  onClick={() => setIsFarmerAuthOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Kisan Login (किसान)</span>
                </button>

                {/* 2. Mandi Operator Login */}
                <button
                  type="button"
                  id="operator-login-modal-btn"
                  onClick={() => setIsOperatorAuthOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl transition cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Operator Desk</span>
                </button>

                {/* 3. Admin Login */}
                <button
                  type="button"
                  id="admin-login-modal-btn"
                  onClick={() => setIsAdminAuthOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-header tabs if user is logged in */}
        {session && (
          <div className="bg-stone-50 border-t border-stone-200 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('PORTAL')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'PORTAL'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {session.role === 'farmer' ? '🌾 Kisan Dashboard & Lots' : session.role === 'operator' ? '🏢 Operator Desk' : '⚙️ Admin Console'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PRICE_DISCOVERY')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'PRICE_DISCOVERY'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                📊 Real-Time Mandi Price Discovery
              </button>
            </div>

            <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
              Real-time synchronization active across APMC Mandis
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* If logged in and in PORTAL tab, show specific role dashboard */}
        {session && activeTab === 'PORTAL' ? (
          <div>
            {session.role === 'farmer' && session.farmer && (
              <FarmerDashboard
                farmer={session.farmer}
                onLogout={handleLogout}
                onSelectCropForLookup={handleCropSelectFromDashboard}
              />
            )}

            {session.role === 'operator' && session.operator && (
              <OperatorDashboard
                operator={session.operator}
                onLogout={handleLogout}
                onSelectCropForLookup={handleCropSelectFromDashboard}
              />
            )}

            {session.role === 'admin' && session.admin && (
              <AdminPortalView
                admin={session.admin}
                onLogout={handleLogout}
                onOpenTestModal={() => setIsTestModalOpen(true)}
              />
            )}
          </div>
        ) : (
          /* Public / Direct Real-Time Mandi Price Discovery Engine */
          <div className="space-y-5">
            {/* Helpful quick guide banner for farmers */}
            <div className="bg-emerald-900/5 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">
                    Live Market Rates &amp; Sell Recommendation / आज के मंडी भाव एवं सलाह
                  </h2>
                  <p className="text-xs text-stone-600">
                    Type your crop name and select your nearest mandi. Response is instantaneous with automated fallback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!session && (
                  <button
                    type="button"
                    onClick={() => setIsFarmerAuthOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Register / Login with Mobile (ओटीपी)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                >
                  View 12-Month Trends
                </button>
              </div>
            </div>

            {/* Input Controls Card: Crop Autocomplete + Location Hierarchy */}
            <section id="lookup-controls-card" className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                {/* 1. Crop Autocomplete with fuzzy matching */}
                <CropAutocomplete
                  selectedCrop={selectedCrop}
                  onSelectCrop={crop => setSelectedCrop(crop)}
                />

                {/* 2. State -> District -> Market Selection with Nearest Geolocation */}
                <LocationSelector
                  statesData={statesHierarchy}
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedMarket={selectedMarket}
                  onChangeLocation={handleLocationChange}
                />
              </div>

              {/* Loading Indicator Banner */}
              {isLoadingPrice && (
                <div id="live-price-loading-state" className="mt-3 py-2 px-3 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 animate-pulse">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></span>
                    Fetching latest {selectedCrop?.name} price for {selectedMarket}…
                  </span>
                  <span className="text-[11px] text-emerald-700">Checking 6h cache &amp; live mandi feed</span>
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 py-2 px-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}
            </section>

            {/* Results Presentation */}
            {lookupResult && (
              <div className="space-y-5">
                {/* Primary Price Metric Card with Min/Max/Modal and Freshness */}
                <PriceDisplayCard
                  data={lookupResult}
                  isLoading={isLoadingPrice}
                  onRefresh={() => {
                    if (selectedCrop) {
                      performPriceLookup(selectedCrop.name, selectedState, selectedDistrict, selectedMarket, userLat, userLng);
                    }
                  }}
                />

                {/* Two Column Visual Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Trend Chart & Sell Window Recommendation (7 cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* 7-Day & 30-Day Trend Chart */}
                    <TrendChart
                      history7d={lookupResult.history7d}
                      history30d={lookupResult.history30d}
                      currentModalPrice={lookupResult.currentPrice.modalPrice}
                    />

                    {/* Sell Window Intelligence Card */}
                    <SellWindowCard
                      recommendation={lookupResult.sellWindow}
                      commodityName={lookupResult.commodity}
                    />
                  </div>

                  {/* Right Column: Nearby Better Markets & Buyer Offers (5 cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Nearby Markets with Higher Prices */}
                    <NearbyMarketsTable
                      markets={lookupResult.nearbyBetterMarkets}
                      currentMarketName={lookupResult.actualReportingMarket}
                      onSelectMarket={handleSwitchToNearbyMarket}
                    />

                    {/* Verified Buyer Demand / Offers */}
                    <BuyerOffersSection
                      offers={lookupResult.buyerOffers}
                      commodityName={lookupResult.commodity}
                      modalPrice={lookupResult.currentPrice.modalPrice}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Real-Time All Crops & Seasonal Directory */}
            <AllCropsRealtimeDirectory
              selectedMandiName={selectedMarket}
              selectedStateName={selectedState}
              selectedDistrictName={selectedDistrict}
              onSelectCropForDeepLookup={crop => {
                setSelectedCrop(crop);
                const el = document.getElementById('lookup-controls-card');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                performPriceLookup(crop.name, selectedState, selectedDistrict, selectedMarket, userLat, userLng);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 mt-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Farmer To Market Connect</span>
            <span>·</span>
            <span>Connected to data.gov.in Agmarknet Variety-wise Daily Market Prices</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>6-Hour Smart Caching Active</span>
            <span>Rate-Limited Outbound API</span>
            <button
              type="button"
              onClick={() => setIsAdminDrawerOpen(true)}
              className="text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              System Telemetry
            </button>
            <button
              type="button"
              onClick={() => setIsTestModalOpen(true)}
              className="text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              Acceptance Tests
            </button>
          </div>
        </div>
      </footer>

      {/* 3 Dedicated Separate Role Login Modals */}
      <FarmerAuthModal
        isOpen={isFarmerAuthOpen}
        onClose={() => setIsFarmerAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <OperatorAuthModal
        isOpen={isOperatorAuthOpen}
        onClose={() => setIsOperatorAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Market History & Long-Term Trends Modal */}
      <MarketHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        defaultCrop={selectedCrop?.name || 'Tomato'}
      />

      {/* Global Live Produce & Payment Tracker Modal */}
      <ProduceTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => {
          setIsTrackerModalOpen(false);
          setTrackerInitialLotId(undefined);
        }}
        initialLotId={trackerInitialLotId}
        isOperatorView={session?.role === 'operator'}
      />

      {/* Acceptance Test Runner Modal */}
      <AcceptanceTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Admin Operations & Telemetry Drawer */}
      <AdminMetricsDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
      />
    </div>
  );
}

