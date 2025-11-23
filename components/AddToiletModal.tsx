import React, { useState } from 'react';
import { X, Save, MapPin } from 'lucide-react';

interface AddToiletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const AddToiletModal: React.FC<AddToiletModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    access: 'yes',
    fee: 'no',
    wheelchair: 'no',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full md:w-[500px] md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
           <div className="flex items-center gap-2">
               <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                   <MapPin className="w-5 h-5" />
               </div>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Restroom</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
               <X className="w-5 h-5" />
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Location Name</label>
                <input 
                    type="text" 
                    required 
                    placeholder="e.g. Gas Station Restroom"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all font-medium text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Access</label>
                     <select 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                        value={formData.access}
                        onChange={e => setFormData({...formData, access: e.target.value})}
                     >
                         <option value="yes">Public</option>
                         <option value="customers">Customers</option>
                         <option value="private">Private</option>
                     </select>
                </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Fee</label>
                     <select 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                        value={formData.fee}
                        onChange={e => setFormData({...formData, fee: e.target.value})}
                     >
                         <option value="no">Free</option>
                         <option value="yes">Paid</option>
                     </select>
                </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Wheelchair</label>
                     <select 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500"
                        value={formData.wheelchair}
                        onChange={e => setFormData({...formData, wheelchair: e.target.value})}
                     >
                         <option value="yes">Yes</option>
                         <option value="no">No</option>
                         <option value="limited">Limited</option>
                     </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Description (Optional)</label>
                <textarea 
                    rows={3}
                    placeholder="Any details? e.g. Key needed from cashier..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all font-medium text-sm resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>
            
            <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Location
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};