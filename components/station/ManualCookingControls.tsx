import React from 'react';
import { PrepMethod, HeatMethod } from '../../types';
import { PREP_DETAILS, HEAT_DETAILS } from '../../constants';
import { Utensils, Sparkles } from 'lucide-react';

interface ManualCookingControlsProps {
  selectedPrep: PrepMethod | null;
  selectedHeat: HeatMethod | null;
  onSelectPrep: (method: PrepMethod) => void;
  onSelectHeat: (method: HeatMethod) => void;
  onCook: () => void;
  isCooking: boolean;
  canCook: boolean;
}

export const ManualCookingControls: React.FC<ManualCookingControlsProps> = ({
  selectedPrep,
  selectedHeat,
  onSelectPrep,
  onSelectHeat,
  onCook,
  isCooking,
  canCook
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col gap-4">
      
      {/* Prep Section */}
      <div className="flex flex-col gap-2">
         <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
           <Utensils size={12} /> 1. Preparation
         </h4>
         <div className="flex gap-3 overflow-x-auto pb-1 px-1 scrollbar-hide">
            {Object.values(PrepMethod).filter(m => m !== PrepMethod.MARINATE).map((method) => {
              const info = PREP_DETAILS[method];
              const isSelected = selectedPrep === method;
              const Icon = info.icon;
              
              return (
                <button
                  key={method}
                  onClick={() => onSelectPrep(method)}
                  disabled={isCooking}
                  className={`
                    flex-1 flex flex-col items-center justify-center gap-1 h-20 rounded-xl transition-all border-2
                    ${isSelected 
                      ? `bg-stone-700 text-white border-stone-700 shadow-md transform scale-[1.02]` 
                      : 'bg-stone-50 text-stone-400 border-stone-100 hover:bg-white hover:border-stone-300 hover:text-stone-600'
                    }
                    ${isCooking ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Icon size={24} strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase">{info.label}</span>
                </button>
              );
            })}
         </div>
      </div>

      {/* Heat Section */}
      <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
           <span className="text-orange-500">🔥</span> 2. Cooking
         </h4>
         <div className="flex gap-3 overflow-x-auto pb-1 px-1 scrollbar-hide">
            {Object.values(HeatMethod).map((method) => {
              const info = HEAT_DETAILS[method];
              const isSelected = selectedHeat === method;
              const Icon = info.icon;
              
              return (
                <button
                  key={method}
                  onClick={() => onSelectHeat(method)}
                  disabled={isCooking}
                  className={`
                    flex-1 flex flex-col items-center justify-center gap-1 h-20 rounded-xl transition-all border-2
                    ${isSelected 
                      ? `bg-${info.color.replace('bg-', '')} text-white border-transparent shadow-lg transform scale-[1.02]` 
                      : 'bg-stone-50 text-stone-400 border-stone-100 hover:bg-white hover:border-stone-300 hover:text-stone-600'
                    }
                    ${isCooking ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Icon size={24} strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase">{info.label}</span>
                </button>
              );
            })}
         </div>
      </div>

      {/* Cook Action Button */}
      <button
        onClick={onCook}
        disabled={!canCook || isCooking}
        className={`
          w-full py-6 rounded-2xl font-display font-black text-2xl shadow-lg transition-all transform flex items-center justify-center gap-3 relative overflow-hidden group flex-shrink-0 border-b-4
          ${canCook && !isCooking
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white border-red-700 hover:scale-[1.01] hover:shadow-2xl active:scale-[0.98] active:border-b-0 active:translate-y-1'
            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
          }
        `}
      >
        {isCooking ? (
          <>
            <Sparkles className="animate-spin text-yellow-300 w-7 h-7" />
            <span className="tracking-widest drop-shadow-md">COOKING...</span>
          </>
        ) : (
          <>
            <span className="group-hover:animate-bounce text-3xl">🔥</span>
            <span className="drop-shadow-md">LET'S COOK!</span>
          </>
        )}
        
        {canCook && !isCooking && (
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
        )}
      </button>

    </div>
  );
};