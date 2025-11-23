import React, { useState, useEffect } from 'react';
import { Map as RouteMap } from './components/Map';
import { RouteInput } from './components/RouteInput';
import { ToiletList } from './components/ToiletList';
import { getRoute, findToiletsAlongRoute } from './services/mapService';
import { analyzeRouteWithAi, getToiletDetails } from './services/geminiService';
import { Coordinates, RouteData, Toilet, AiAnalysis, ViewState } from './types';
import { Sparkles, AlertTriangle, Map as MapIcon, List, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);
  const [startLoc, setStartLoc] = useState<Coordinates | null>(null);
  const [endLoc, setEndLoc] = useState<Coordinates | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [aiToiletTip, setAiToiletTip] = useState<string>('');
  
  // Mobile Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Persistence for user submissions
  const [localToilets, setLocalToilets] = useState<Toilet[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('user_toilets');
    if (saved) {
      setLocalToilets(JSON.parse(saved));
    }
  }, []);

  const handleRouteSubmit = async (start: Coordinates, end: Coordinates) => {
    setViewState(ViewState.ROUTING);
    setStartLoc(start);
    setEndLoc(end);
    setAiAnalysis(null);
    setToilets([]);
    
    // On mobile, auto-hide panel to show the route being calculated/map
    if (window.innerWidth < 768) {
        setIsPanelOpen(false);
    }

    try {
      // 1. Get Route
      const route = await getRoute(start, end);
      setRouteData(route);
      
      // 2. Find Toilets
      const foundToilets = await findToiletsAlongRoute(route);
      
      const allToilets = [...foundToilets, ...localToilets.map(t => ({...t, distanceFromRoute: 0}))]; 
      setToilets(allToilets);

      // 3. AI Analysis
      const analysis = await analyzeRouteWithAi(route, allToilets);
      setAiAnalysis(analysis);

      setViewState(ViewState.NAVIGATING);
    } catch (error) {
      console.error(error);
      alert("Failed to calculate route. Please check your locations.");
      setViewState(ViewState.IDLE);
      setIsPanelOpen(true);
    }
  };

  const handleToiletSelect = async (id: string | number) => {
    const t = toilets.find(item => item.id === id);
    if (t) {
      setSelectedToilet(t);
      // Ask Gemini for a quick tip about this specific toilet
      setAiToiletTip("Loading AI insight...");
      const tip = await getToiletDetails(t);
      setAiToiletTip(tip);
      
      // Open panel on mobile to show details
      setIsPanelOpen(true);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100 dark:bg-slate-950 font-sans text-gray-900 dark:text-gray-100">
      
      {/* Map Layer (Full Screen Background) */}
      <div className="absolute inset-0 z-0">
        <RouteMap 
            routeCoordinates={routeData?.coordinates || null} 
            toilets={toilets}
            startLocation={startLoc}
            endLocation={endLoc}
            selectedToiletId={selectedToilet?.id || null}
            onToiletSelect={handleToiletSelect}
            padding={isPanelOpen && window.innerWidth > 768 ? [400, 20] : [20, 20]}
        />
      </div>

      {/* Helper Overlay (Empty State) - Desktop Only */}
      {!routeData && (
        <div className="hidden md:flex absolute top-10 right-10 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 items-center gap-4 animate-in fade-in slide-in-from-top-4">
             <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <MapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
             </div>
             <div>
                 <h3 className="font-bold text-gray-800 dark:text-white">Explore your route</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Find reliable restrooms for your journey.</p>
             </div>
        </div>
      )}

      {/* Mobile Floating Controls */}
      <div className="md:hidden absolute bottom-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
         {!isPanelOpen && (
              <button 
                onClick={() => setIsPanelOpen(true)}
                className="pointer-events-auto bg-gray-900 dark:bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-4 active:scale-95 transition-transform"
              >
                <List className="w-5 h-5" />
                View List {toilets.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{toilets.length}</span>}
              </button>
         )}
      </div>

      {/* Main Floating Panel */}
      <div className={`
        absolute z-40 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        md:top-4 md:left-4 md:bottom-4 md:w-[420px] md:rounded-3xl md:border md:border-white/50 dark:md:border-slate-700
        inset-0 md:inset-auto md:translate-y-0
        ${isPanelOpen ? 'translate-y-0' : 'translate-y-[105%] md:translate-y-0'}
      `}>
        
        {/* Mobile Header (Close Button) */}
        <div className="md:hidden flex justify-center items-center p-2 border-b border-gray-100 dark:border-slate-800 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm cursor-pointer" onClick={() => setIsPanelOpen(false)}>
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full my-2" />
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                    <span className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white p-1.5 rounded-lg shadow-sm">RS</span> 
                    <span className="tracking-tight text-gray-900 dark:text-white">RestStop</span>
                </h1>
                
                <RouteInput onRouteSubmit={handleRouteSubmit} isLoading={viewState === ViewState.ROUTING} />
            </div>

            {/* AI Analysis Card */}
            {aiAnalysis && (
                <div className="mx-6 mb-6">
                    <div className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all ${
                        aiAnalysis.comfortRating === 'High' ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 
                        aiAnalysis.comfortRating === 'Medium' ? 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' : 'bg-rose-50/80 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800'
                    }`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Route Analysis</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed mb-3">{aiAnalysis.advice}</p>
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-white/60 dark:bg-black/30 px-2 py-1 rounded-md border border-black/5 dark:border-white/10 font-medium text-gray-600 dark:text-gray-300">
                                Comfort: <strong className="text-gray-900 dark:text-white">{aiAnalysis.comfortRating}</strong>
                            </span>
                            {aiAnalysis.longGaps && (
                                <span className="text-xs bg-red-100/80 dark:bg-red-900/40 px-2 py-1 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Long Gaps
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Switcher: Toilet List or Detail View */}
            <div className="bg-gray-50/50 dark:bg-slate-900/30 min-h-[300px] border-t border-gray-100 dark:border-slate-800">
                {selectedToilet ? (
                    <div className="p-6 animate-in slide-in-from-right duration-300">
                        <button onClick={() => setSelectedToilet(null)} className="group flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-4 transition-colors">
                            <ChevronDown className="w-4 h-4 rotate-90" /> Back to results
                        </button>
                        
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedToilet.name}</h2>
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedToilet.access === 'yes' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                    {selectedToilet.access === 'yes' ? 'Public' : 'Restricted'}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedToilet.fee === 'no' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                    {selectedToilet.fee === 'no' ? 'Free' : 'Paid'}
                                </span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl mb-6 border border-blue-100/50 dark:border-blue-800/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">AI Insight</span>
                                </div>
                                <p className="text-sm text-blue-900/80 dark:text-blue-200/90 italic leading-relaxed">"{aiToiletTip}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Wheelchair</span>
                                    <span className="text-gray-700 dark:text-gray-300">{selectedToilet.wheelchair === 'yes' ? 'Accessible' : 'No info / Not Accessible'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Opening Hours</span>
                                    <span className="text-gray-700 dark:text-gray-300">{selectedToilet.opening_hours || 'Not specified'}</span>
                                </div>
                            </div>
                            
                            {selectedToilet.description && (
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <h4 className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selectedToilet.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 pt-6 pb-2 flex justify-between items-end">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Restrooms</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                    {toilets.length > 0 ? `${toilets.length} locations found` : 'Find facilities along route'}
                                </p>
                            </div>
                        </div>
                        <ToiletList toilets={toilets} onSelect={handleToiletSelect} selectedId={selectedToilet?.id || null} />
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;