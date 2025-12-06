import React from 'react';
import { DishResult } from '../../types';

interface HistoryStripProps {
  history: DishResult[];
  onShowHistory: (dish: DishResult) => void;
}

export const HistoryStrip: React.FC<HistoryStripProps> = ({ history, onShowHistory }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-stone-50 rounded-3xl p-5 border-2 border-stone-100 shadow-inner overflow-hidden flex-shrink-0 mt-2">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-stone-300 rounded-full"></span>
            Recent Dishes
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {history.map((dish, idx) => (
                <button
                    key={idx}
                    onClick={() => onShowHistory(dish)}
                    className="flex-shrink-0 flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-stone-200 shadow-sm hover:shadow-xl hover:border-chef-300 w-44 transition-all cursor-pointer group hover:-translate-y-1"
                >
                     {dish.imageUrl ? (
                       <div className="w-full aspect-video mb-3 rounded-xl overflow-hidden bg-stone-100 relative shadow-inner">
                         <img 
                           src={dish.imageUrl} 
                           alt={dish.dishName} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                         />
                       </div>
                    ) : (
                       <div className="w-full aspect-video mb-3 rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                          {dish.emoji}
                       </div>
                    )}
                    
                    <div className="flex items-center justify-between w-full px-1 mb-1">
                         <span className={`text-xl font-black leading-none ${dish.score >= 80 ? 'text-green-500' : dish.score <= 30 ? 'text-red-500' : 'text-stone-700'}`}>
                            {dish.score}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${dish.score >= 80 ? 'bg-green-500' : dish.score <= 30 ? 'bg-red-500' : 'bg-stone-300'}`}></div>
                    </div>
                    
                    <div className="w-full h-[2px] bg-stone-100 my-2"></div>
                    <span className="text-sm font-bold text-stone-600 truncate w-full text-left leading-tight">{dish.dishName}</span>
                </button>
            ))}
        </div>
    </div>
  );
};