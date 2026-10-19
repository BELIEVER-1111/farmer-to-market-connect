import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, CheckCircle2 } from 'lucide-react';
import { StateHierarchy, MandiMarket } from '../types';

interface LocationSelectorProps {
  statesData: StateHierarchy[];
  selectedState: string;
  selectedDistrict: string;
  selectedMarket: string;
  onChangeLocation: (state: string, district: string, market: string, lat?: number, lng?: number) => void;
  isLoadingLocation?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  statesData,
  selectedState,
  selectedDistrict,
  selectedMarket,
  onChangeLocation,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const currentStateObj = statesData.find(s => s.state === selectedState) || statesData[0];
  const availableDistricts = currentStateObj?.districts || [];
  const currentDistrictObj = availableDistricts.find(d => d.district === selectedDistrict) || availableDistricts[0];
  const availableMarkets = currentDistrictObj?.markets || [];

  // Nearest to me geolocation handler
  const handleNearestToMe = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoMessage('Detecting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await fetch(`/api/locations/nearest?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            const nearest: MandiMarket & { distanceKm: number } = data.nearest;
            setGeoMessage(`Nearest: ${nearest.name} (~${nearest.distanceKm} km away)`);
            onChangeLocation(nearest.state, nearest.district, nearest.name, lat, lng);
          } else {
            setGeoMessage('Unable to resolve nearest mandi.');
          }
        } catch (err) {
          console.error(err);
          setGeoMessage('Location resolution failed.');
        } finally {
          setIsLocating(false);
        }
      },
      err => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMessage('Location permission was denied. Please select manually below.');
        } else {
          setGeoMessage('Could not acquire location. Please select manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  const handleStateChange = (newState: string) => {
    const sObj = statesData.find(s => s.state === newState);
    const firstDist = sObj?.districts[0]?.district || '';
    const firstMarket = sObj?.districts[0]?.markets[0]?.name || '';
    setGeoMessage(null);
    onChangeLocation(newState, firstDist, firstMarket);
  };

  const handleDistrictChange = (newDist: string) => {
    const dObj = availableDistricts.find(d => d.district === newDist);
    const firstMarket = dObj?.markets[0]?.name || '';
    setGeoMessage(null);
    onChangeLocation(selectedState, newDist, firstMarket);
  };

  const handleMarketChange = (newMarket: string) => {
    setGeoMessage(null);
    onChangeLocation(selectedState, selectedDistrict, newMarket);
  };

  return (
    <div id="location-selector-section" className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-stone-700 tracking-wider uppercase flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          2. Select Mandi Location
        </label>

        {/* Nearest to Me Geolocation Button */}
        <button
          type="button"
          id="nearest-to-me-btn"
          onClick={handleNearestToMe}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-md transition cursor-pointer disabled:opacity-50"
        >
          {isLocating ? (
            <span className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Navigation className="w-3 h-3 text-emerald-700" />
          )}
          Nearest to Me
        </button>
      </div>

      {geoMessage && (
        <div id="geo-status-banner" className="mb-2 text-xs px-2.5 py-1 rounded bg-emerald-50/80 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{geoMessage}</span>
        </div>
      )}

      {/* Cascading Dropdowns: State -> District -> Market */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* State */}
        <div>
          <label htmlFor="select-state" className="block text-[11px] font-medium text-stone-500 mb-1">
            State
          </label>
          <div className="relative">
            <select
              id="select-state"
              value={selectedState}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full pl-2.5 pr-8 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition appearance-none cursor-pointer"
            >
              {statesData.map(s => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* District */}
        <div>
          <label htmlFor="select-district" className="block text-[11px] font-medium text-stone-500 mb-1">
            District
          </label>
          <div className="relative">
            <select
              id="select-district"
              value={selectedDistrict}
              onChange={e => handleDistrictChange(e.target.value)}
              className="w-full pl-2.5 pr-8 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition appearance-none cursor-pointer"
            >
              {availableDistricts.map(d => (
                <option key={d.district} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Market / Mandi */}
        <div>
          <label htmlFor="select-market" className="block text-[11px] font-medium text-stone-500 mb-1 flex items-center justify-between">
            <span>Market / Mandi</span>
            <span className="text-[10px] text-stone-400 font-normal">Instant fetch</span>
          </label>
          <div className="relative">
            <select
              id="select-market"
              value={selectedMarket}
              onChange={e => handleMarketChange(e.target.value)}
              className="w-full pl-2.5 pr-8 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition appearance-none cursor-pointer"
            >
              {availableMarkets.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
