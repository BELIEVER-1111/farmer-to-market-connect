import React, { useState } from 'react';
import { FarmerLot } from '../../types';
import { getStoredLots, getLotById, searchLots } from '../../services/farmerLotsService';
import { ProduceLifecycleTracker } from './ProduceLifecycleTracker';
import { Search, X, Truck, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface ProduceTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLotId?: string;
  isOperatorView?: boolean;
}

export const ProduceTrackerModal: React.FC<ProduceTrackerModalProps> = ({
  isOpen,
  onClose,
  initialLotId,
  isOperatorView = false,
}) => {
  const [allLots, setAllLots] = useState<FarmerLot[]>(() => getStoredLots());
  const [selectedLot, setSelectedLot] = useState<FarmerLot | null>(() => {
    if (initialLotId) {
      return getLotById(initialLotId) || allLots[0] || null;
    }
    return allLots[0] || null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FarmerLot[]>([]);

  React.useEffect(() => {
    if (initialLotId) {
      const found = getLotById(initialLotId);
      if (found) setSelectedLot(found);
    }
  }, [initialLotId]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const res = searchLots(searchQuery);
    setSearchResults(res);
    if (res.length === 1) {
      setSelectedLot(res[0]);
    }
  };

  const handleLotUpdated = (updatedLot: FarmerLot) => {
    setSelectedLot(updatedLot);
    setAllLots(getStoredLots());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header Bar */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              🚚
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Farmer to Seller Live Produce & Payout Tracker</span>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-2 py-0.5 rounded-full font-normal">
                  लाइव ट्रैकर
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Track harvest from farmgate to buyer delivery, weighment, GPS transport, and instant bank payout.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Lot Selector & Search Strip */}
        <div className="bg-stone-100 p-3 sm:px-6 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Click Demo Lots */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs font-semibold text-stone-600 shrink-0">Sample Lots:</span>
            {allLots.slice(0, 4).map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLot(l);
                  setSearchResults([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedLot?.id === l.id
                    ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <span>{l.cropName}</span>
                <span className="text-[10px] opacity-75 font-mono">({l.id.toUpperCase()})</span>
                {l.trackingStage === 'IN_TRANSIT' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Lot ID / Farmer Mobile"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs rounded-lg font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Results Dropdown if any */}
        {searchResults.length > 1 && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 px-6 text-xs flex items-center gap-2 overflow-x-auto">
            <span className="font-semibold text-amber-900">Found {searchResults.length} lots:</span>
            {searchResults.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedLot(r);
                  setSearchResults([]);
                }}
                className="px-2.5 py-1 bg-white border border-amber-300 rounded-md hover:bg-amber-100 font-medium text-amber-900"
              >
                {r.cropName} ({r.id}) - {r.farmerName}
              </button>
            ))}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-100">
          {selectedLot ? (
            <ProduceLifecycleTracker
              lot={selectedLot}
              onLotUpdated={handleLotUpdated}
              showOperatorControls={isOperatorView}
              onClose={onClose}
              onSelectAnotherLot={setSelectedLot}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
              <Truck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No Lot Selected</p>
              <p className="text-xs text-stone-500 mt-1">
                Select one of the sample lots above or enter a Lot ID to view its live lifecycle tracking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
