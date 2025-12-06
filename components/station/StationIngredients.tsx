
import React from 'react';
import { KitchenItem, AnyCookingMethod, Language } from '../../types';
import { COOKING_CONSTANTS } from '../../constants';
import { ChefHat, ArrowUp, X } from 'lucide-react';
import { t } from '../../translations';
import { getIngredientAnimClass } from '../../utils/stationUtils';

interface StationIngredientsProps {
  items: KitchenItem[];
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR';
  isCooking: boolean;
  activeAnimationMethod: AnyCookingMethod | null | undefined;
  cookingProgress: number;
  language: Language;
  onRemoveItem: (item: KitchenItem, from: 'PREP' | 'MARINATE' | 'COOK' | 'BAR') => void;
}

export const StationIngredients: React.FC<StationIngredientsProps> = ({
  items,
  mode,
  isCooking,
  activeAnimationMethod,
  cookingProgress,
  language,
  onRemoveItem
}) => {
    if (items.length === 0) {
        return (
            <div className={`text-center animate-pulse pointer-events-none relative z-20 ${mode === 'BAR' ? 'text-white/30' : 'text-stone-400/50'}`}>
                <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 opacity-20" />
                <p className="font-display font-bold text-base sm:text-lg">{t('emptyVessel', language)}</p>
                <div className="flex flex-col items-center gap-1 mt-4 opacity-60">
                    <ArrowUp className="animate-bounce" />
                    <span className="text-xs">{t('tapBelow', language)}</span>
                </div>
            </div>
        );
    }

    let itemFilter = "";
    if (isCooking && (mode === 'COOK' || mode === 'BAR')) {
        if (cookingProgress > COOKING_CONSTANTS.PERFECT_END) itemFilter = "brightness-50 sepia grayscale contrast-125"; // Burnt
        else if (cookingProgress < COOKING_CONSTANTS.PERFECT_START && cookingProgress > 20) itemFilter = ""; 
        else if (cookingProgress >= COOKING_CONSTANTS.PERFECT_START) itemFilter = "saturate-150 brightness-90 sepia-[.3]"; // Golden/Mixed
    }

    const itemCount = items.length;
    let sizeClass = "text-5xl sm:text-7xl md:text-8xl";
    let marginClass = "mx-[-12px]";
    let useOffsets = true;

    if (itemCount > 15) {
        sizeClass = "text-2xl sm:text-3xl md:text-4xl";
        marginClass = "mx-[-6px]";
        useOffsets = false;
    } else if (itemCount > 8) {
        sizeClass = "text-3xl sm:text-5xl md:text-6xl";
        marginClass = "mx-[-8px]";
        useOffsets = false;
    }

    return (
        <div className="flex flex-wrap items-center justify-center z-10 p-4 w-full h-full content-center relative">
            {items.map((ing, index) => {
                const rotation = (index % 2 === 0 ? 'rotate-12' : '-rotate-12');
                const offsetMap = ['translate-x-0 translate-y-0', '-translate-x-6 translate-y-4', 'translate-x-6 translate-y-4', '-translate-x-3 -translate-y-4', 'translate-x-3 -translate-y-4'];
                // Only apply random offsets if not Blend (blend piles up in middle)
                const isBlend = activeAnimationMethod === 'BLEND';
                const randomOffset = (useOffsets && !isBlend) ? offsetMap[index % 5] : '';
                
                return (
                    <div key={`${ing.instanceId}`} className={`relative group ${marginClass}`}>
                        <div 
                            className={`
                                flex flex-col items-center justify-center
                                transition-all duration-300
                                ${getIngredientAnimClass(isCooking, activeAnimationMethod)}
                                ${!isCooking && rotation}
                                ${!isCooking && randomOffset}
                                ${itemFilter}
                            `}
                            style={{ 
                                animationDelay: isCooking ? `${Math.random() * 0.2}s` : '0s',
                                zIndex: 10 + index,
                            }}
                        >
                            <div className={`${sizeClass} filter drop-shadow-2xl transform transition-transform hover:scale-110 cursor-default select-none`}>
                                {ing.emoji}
                            </div>
                            
                            {ing.status !== 'raw' && (
                                <span className={`bg-white/90 text-stone-800 px-1.5 py-0.5 rounded-full font-bold shadow-sm -mt-2 z-20 ${itemCount > 15 ? 'text-[6px] sm:text-[8px]' : 'text-[8px] sm:text-[10px]'}`}>
                                    {ing.status}
                                </span>
                            )}
                        </div>
                        
                        {!isCooking && (
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onRemoveItem(ing, mode); 
                                }}
                                className={`absolute top-0 right-0 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-50 transition-all transform scale-0 group-hover:scale-100 z-50 border border-red-100 ${itemCount > 15 ? 'p-0.5' : 'p-1 sm:p-2'}`}
                            >
                                <X size={itemCount > 15 ? 10 : 12} className={itemCount > 15 ? "" : "sm:w-4 sm:h-4"} />
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    );
};
