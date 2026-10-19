import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Sparkles, Leaf } from 'lucide-react';
import { CropInfo } from '../types';

interface CropAutocompleteProps {
  selectedCrop: CropInfo | null;
  onSelectCrop: (crop: CropInfo) => void;
}

export const POPULAR_CROPS = [
  // Major Food Crops (Cereals & Millets)
  { name: 'Rice (Dhan)', alias: 'धान', id: 'paddy_dhan', season: 'Kharif' },
  { name: 'Wheat', alias: 'गेहूं', id: 'wheat', season: 'Rabi' },
  { name: 'Maize', alias: 'मक्का', id: 'maize', season: 'Kharif' },
  { name: 'Jowar', alias: 'ज्वार', id: 'jowar', season: 'Kharif' },
  { name: 'Bajra', alias: 'बाजरा', id: 'bajra', season: 'Kharif' },
  { name: 'Ragi', alias: 'रागी', id: 'ragi', season: 'Kharif' },
  // Pulses
  { name: 'Chana (Gram)', alias: 'चना', id: 'gram_chana', season: 'Rabi' },
  { name: 'Arhar (Tur)', alias: 'अरहर', id: 'tur_arhar', season: 'Kharif' },
  { name: 'Moong', alias: 'मूंग', id: 'moong', season: 'Kharif' },
  { name: 'Masoor', alias: 'मसूर', id: 'masoor', season: 'Rabi' },
  // Cash & Commercial
  { name: 'Sugarcane', alias: 'गन्ना', id: 'sugarcane', season: 'Kharif' },
  { name: 'Cotton', alias: 'कपास', id: 'cotton', season: 'Kharif' },
  { name: 'Jute', alias: 'पटसन', id: 'jute', season: 'Kharif' },
  // Oilseeds
  { name: 'Mustard', alias: 'सरसों', id: 'mustard', season: 'Rabi' },
  { name: 'Soyabean', alias: 'सोयाबीन', id: 'soyabean', season: 'Kharif' },
  { name: 'Groundnut', alias: 'मूंगफली', id: 'groundnut', season: 'Kharif' },
  { name: 'Sunflower', alias: 'सूरजमुखी', id: 'sunflower', season: 'Kharif' },
  // Zaid & Vegetables
  { name: 'Watermelon', alias: 'तरबूज', id: 'watermelon', season: 'Zaid' },
  { name: 'Cucumber', alias: 'खीरा', id: 'cucumber', season: 'Zaid' },
  { name: 'Tomato', alias: 'टमाटर', id: 'tomato', season: 'All-Year' },
  { name: 'Onion', alias: 'प्याज', id: 'onion', season: 'Rabi' },
  { name: 'Potato', alias: 'आलू', id: 'potato', season: 'Rabi' },
];

export const CropAutocomplete: React.FC<CropAutocompleteProps> = ({ selectedCrop, onSelectCrop }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{ crop: CropInfo; score: number; matchedAlias?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced 300ms search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/crops/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Failed to search crops', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (crop: CropInfo) => {
    onSelectCrop(crop);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div id="crop-autocomplete-section" className="relative w-full" ref={dropdownRef}>
      <label htmlFor="crop-search-input" className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-emerald-700" />
          1. Select or Search Crop
        </span>
        <span className="text-[11px] font-normal text-stone-500 normal-case">
          Supports Hindi, Telugu, Tamil, Marathi & typos
        </span>
      </label>

      {/* Input container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-stone-500" />
        </div>

        <input
          id="crop-search-input"
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedCrop ? `${selectedCrop.name} (${selectedCrop.aliases[0] || 'Selected'}) - Type to change...` : 'Type crop name (e.g. "tomatto", "pyaz", "aloo", "wheat")...'}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition shadow-xs"
        />

        {query ? (
          <button
            type="button"
            id="clear-crop-search-btn"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        ) : selectedCrop ? (
          <span className="absolute right-3 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            {selectedCrop.name}
          </span>
        ) : null}
      </div>

      {/* Quick Select Crop Pills */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-stone-500">Quick:</span>
        {POPULAR_CROPS.map(c => {
          const isCurrent = selectedCrop?.id === c.id;
          return (
            <button
              key={c.id}
              id={`quick-crop-pill-${c.id}`}
              type="button"
              onClick={() => {
                // Find and select
                fetch(`/api/crops/search?q=${encodeURIComponent(c.name)}`)
                  .then(r => r.json())
                  .then(data => {
                    const match = data.results?.[0]?.crop;
                    if (match) handleSelect(match);
                  });
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition border ${
                isCurrent
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              {c.name} <span className="opacity-75 text-[10px]">({c.alias})</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div
          id="crop-search-dropdown"
          className="absolute z-40 left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto divide-y divide-stone-100"
        >
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></span>
              Searching crop master records...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-500">
              No crops matched &quot;{query}&quot;. Try typing &quot;tomato&quot;, &quot;onion&quot;, or &quot;chana&quot;.
            </div>
          ) : (
            results.map(({ crop, matchedAlias, score }) => {
              const isSelected = selectedCrop?.id === crop.id;
              return (
                <button
                  key={crop.id}
                  id={`crop-option-${crop.id}`}
                  type="button"
                  onClick={() => handleSelect(crop)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-emerald-50/60 transition ${
                    isSelected ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">{crop.name}</span>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {crop.category}
                      </span>
                      {crop.season && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {crop.season}
                        </span>
                      )}
                      {isSelected && (
                        <span className="flex items-center text-emerald-700 text-xs font-medium">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                      <span>Aliases:</span>
                      <span className="text-stone-700">{crop.aliases.slice(0, 4).join(', ')}</span>
                      {matchedAlias && query && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5" />
                          Matched: &quot;{matchedAlias}&quot; ({Math.round(score * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-stone-500">
                    {crop.benchmarkModalPrice && (
                      <div className="font-bold text-stone-800 text-xs">
                        ₹{crop.benchmarkModalPrice.toLocaleString('en-IN')}/{crop.defaultUnit}
                      </div>
                    )}
                    <div className="text-[10px] text-stone-400">Shelf life: {crop.shelfLifeDays}d</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
