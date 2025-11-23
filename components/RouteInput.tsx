import React, { useState, useEffect, useRef } from 'react';
import { Navigation, CircleDot, MapPin, Loader2 } from 'lucide-react';
import { searchLocations } from '../services/mapService';
import { LocationSuggestion, Coordinates } from '../types';

interface RouteInputProps {
  onRouteSubmit: (start: Coordinates, end: Coordinates) => void;
  isLoading: boolean;
}

export const RouteInput: React.FC<RouteInputProps> = ({ onRouteSubmit, isLoading }) => {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startCoords, setStartCoords] = useState<Coordinates | null>(null);
  const [endCoords, setEndCoords] = useState<Coordinates | null>(null);
  
  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (activeField === 'start' && startQuery.length > 2) {
        setIsSearching(true);
        const results = await searchLocations(startQuery);
        setStartSuggestions(results);
        setIsSearching(false);
      } else if (activeField === 'end' && endQuery.length > 2) {
        setIsSearching(true);
        const results = await searchLocations(endQuery);
        setEndSuggestions(results);
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [startQuery, endQuery, activeField]);

  const handleSelect = (suggestion: LocationSuggestion, type: 'start' | 'end') => {
    const coords = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    if (type === 'start') {
      setStartQuery(suggestion.display_name.split(',')[0]); 
      setStartCoords(coords);
      setStartSuggestions([]);
    } else {
      setEndQuery(suggestion.display_name.split(',')[0]);
      setEndCoords(coords);
      setEndSuggestions([]);
    }
    setActiveField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startCoords && endCoords) {
      onRouteSubmit(startCoords, endCoords);
    }
  };

  const useCurrentLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              const coords = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              };
              setStartCoords(coords);
              setStartQuery("Current Location");
          }, () => {
              alert("Unable to retrieve location");
          });
      }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <div className="absolute left-[19px] top-[42px] bottom-[42px] w-0.5 bg-gray-200 dark:bg-slate-700 z-0"></div>

        {/* Start Input */}
        <div className="relative group z-20">
          <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5 ml-1 block tracking-wider">Start Point</label>
          <div className={`flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl border transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm ${activeField === 'start' ? 'ring-2 ring-blue-500/20 border-blue-500 bg-white dark:bg-slate-800' : 'border-gray-200 dark:border-slate-700'}`}>
             <div className="pl-3 py-3">
                <CircleDot className="w-4 h-4 text-blue-600 dark:text-blue-500" />
             </div>
             <input
                type="text"
                autoComplete="off"
                value={startQuery}
                onFocus={() => setActiveField('start')}
                onChange={(e) => { setStartQuery(e.target.value); }}
                placeholder="Current Location..."
                className="w-full pl-3 pr-3 py-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-semibold"
             />
             <button type="button" onClick={useCurrentLocation} className="p-2 mr-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-500 transition-colors" title="Use Current Location">
                 <Navigation className="w-4 h-4" />
             </button>
          </div>

          {activeField === 'start' && startSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <ul className="max-h-[240px] overflow-y-auto custom-scrollbar">
                {startSuggestions.map(s => (
                  <li key={s.place_id} onClick={() => handleSelect(s, 'start')} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm border-b border-gray-50 dark:border-slate-700 last:border-0 group transition-colors">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{s.display_name.split(',')[0]}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{s.display_name}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* End Input */}
        <div className="relative group z-10">
          <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5 ml-1 block tracking-wider">Destination</label>
          <div className={`flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl border transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm ${activeField === 'end' ? 'ring-2 ring-blue-500/20 border-blue-500 bg-white dark:bg-slate-800' : 'border-gray-200 dark:border-slate-700'}`}>
             <div className="pl-3 py-3">
                <MapPin className="w-4 h-4 text-red-500 dark:text-red-400" />
             </div>
             <input
                type="text"
                autoComplete="off"
                value={endQuery}
                onFocus={() => setActiveField('end')}
                onChange={(e) => { setEndQuery(e.target.value); }}
                placeholder="Where to?"
                className="w-full pl-3 pr-3 py-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-semibold"
             />
             {isSearching && activeField === 'end' && (
                 <div className="pr-3">
                     <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                 </div>
             )}
          </div>

          {activeField === 'end' && endSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <ul className="max-h-[240px] overflow-y-auto custom-scrollbar">
                {endSuggestions.map(s => (
                  <li key={s.place_id} onClick={() => handleSelect(s, 'end')} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm border-b border-gray-50 dark:border-slate-700 last:border-0 group transition-colors">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{s.display_name.split(',')[0]}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{s.display_name}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !startCoords || !endCoords}
          className="w-full bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-gray-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5 fill-current" />}
          {isLoading ? 'Calculating Route...' : 'Find Restrooms'}
        </button>
      </form>
    </div>
  );
};