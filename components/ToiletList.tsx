import React, { useState } from 'react';
import { Toilet } from '../types';
import { Accessibility, Banknote, Clock, MapPin, ChevronRight, Euro } from 'lucide-react';

interface ToiletListProps {
  toilets: Toilet[];
  onSelect: (id: string | number) => void;
  selectedId: string | number | null;
}

export const ToiletList: React.FC<ToiletListProps> = ({ toilets, onSelect, selectedId }) => {
  const [filter, setFilter] = useState<'all' | 'accessible' | 'free'>('all');

  const filteredToilets = toilets.filter(t => {
    if (filter === 'accessible') return t.wheelchair === 'yes';
    if (filter === 'free') return t.fee === 'no';
    return true;
  });

  if (toilets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-blue-300 dark:text-blue-500" />
        </div>
        <h3 className="text-gray-900 dark:text-white font-bold mb-1">No restrooms found yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">Enter your route above to find facilities along your way.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-6 py-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('accessible')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${filter === 'accessible' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    <Accessibility className="w-3.5 h-3.5" /> Accessible
                </button>
                <button 
                    onClick={() => setFilter('free')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${filter === 'free' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    <Banknote className="w-3.5 h-3.5" /> Free
                </button>
            </div>
        </div>

        {/* List */}
        <div className="p-4 space-y-3 pb-24 md:pb-6">
            {filteredToilets.map(toilet => (
                <div 
                    key={toilet.id}
                    onClick={() => onSelect(toilet.id)}
                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5
                        ${selectedId === toilet.id 
                            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-900/20 ring-1 ring-blue-500/20 shadow-md' 
                            : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{toilet.name}</h3>
                            <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                {toilet.access === 'yes' ? 'Public' : 'Restricted'} • {toilet.fee === 'no' ? 'Free' : 'Paid'}
                            </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                            {toilet.distanceFromRoute !== undefined && (
                                <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full border ${toilet.distanceFromRoute < 300 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'}`}>
                                    +{Math.round(toilet.distanceFromRoute)}m
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-slate-700">
                        {toilet.wheelchair === 'yes' ? (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                                <Accessibility className="w-3 h-3" /> Yes
                            </div>
                        ) : (
                             <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700/50 px-2 py-1 rounded-md opacity-60">
                                <Accessibility className="w-3 h-3" /> No
                            </div>
                        )}
                        
                        {toilet.fee === 'no' ? (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                                <Banknote className="w-3 h-3" /> Free
                            </div>
                        ) : (
                             <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                                <Euro className="w-3 h-3" /> Paid
                            </div>
                        )}

                        <div className="flex-1 text-right">
                             <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 inline-block group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                </div>
            ))}
            
             {filteredToilets.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">No results match this filter.</p>
                </div>
             )}
        </div>
    </div>
  );
};