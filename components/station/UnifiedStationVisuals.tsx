
import React, { useMemo } from 'react';
import { Ingredient, PrepMethod, HeatMethod, AnyCookingMethod, KitchenItem, Language, Customer } from '../../types';
import { PREP_DETAILS, HEAT_DETAILS } from '../../constants';
import { getContainerVisuals } from '../../utils/stationUtils';
import { StationBackground } from './StationBackground';
import { CookingEffects, CookingSteam } from './CookingEffects';
import { StationIngredients } from './StationIngredients';
import { ChefHat } from 'lucide-react';
import { CustomerTicket } from '../CustomerTicket';

interface UnifiedStationVisualsProps {
  selectedIngredients: Ingredient[];
  selectedSeasonings: Ingredient[];
  resolvedMethod: AnyCookingMethod | null;
  isCooking: boolean;
  onRemoveIngredient: (ingredient: Ingredient) => void;
  onRemoveSeasoning: (ingredient: Ingredient) => void;
  language: Language;
  currentCustomer: Customer | null;
  isLoadingCustomer?: boolean;
}

export const UnifiedStationVisuals: React.FC<UnifiedStationVisualsProps> = ({
  selectedIngredients,
  selectedSeasonings,
  resolvedMethod,
  isCooking,
  onRemoveIngredient,
  onRemoveSeasoning,
  language,
  currentCustomer,
  isLoadingCustomer
}) => {
  // Convert resolvedMethod to mode for utils
  const derivedMode = useMemo(() => {
    if (Object.values(HeatMethod).includes(resolvedMethod as HeatMethod)) return 'COOK';
    if (resolvedMethod === PrepMethod.BLEND || resolvedMethod === PrepMethod.CHOP) return 'PREP';
    return 'PREP'; // Default
  }, [resolvedMethod]);

  const visuals = getContainerVisuals(
    derivedMode,
    resolvedMethod,
    (derivedMode === 'COOK' ? resolvedMethod : null) as HeatMethod | null,
    null,
    isCooking,
    language === 'zh',
    'default' // Default theme for now as CookingStation is legacy/simple
  );

  // Convert Ingredient to KitchenItem for StationIngredients component
  const kitchenItems = useMemo(() => {
    const items: KitchenItem[] = [
      ...selectedIngredients.map(i => ({ ...i, instanceId: i.id + Math.random(), status: 'raw' as const })),
      ...selectedSeasonings.map(i => ({ ...i, instanceId: i.id + Math.random(), status: 'raw' as const }))
    ];
    return items;
  }, [selectedIngredients, selectedSeasonings]);

  // Wrapper for removal to adapt back to simple Ingredient
  const handleRemoveItem = (item: KitchenItem) => {
    // Check if it's in seasoning list
    if (selectedSeasonings.some(s => s.id === item.id)) {
        onRemoveSeasoning(item);
    } else {
        onRemoveIngredient(item);
    }
  };

  return (
    <div className="flex-1 rounded-3xl shadow-inner border-4 border-stone-200/50 p-6 flex flex-col items-center relative overflow-hidden min-h-[340px]">
        
        <StationBackground mode={derivedMode} theme="default" />

        {/* Environment Decor */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/40 backdrop-blur-sm border-t border-white/50 pointer-events-none"></div>

        {!isCooking && <CustomerTicket customer={currentCustomer} isLoading={isLoadingCustomer} language={language} />}

        <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
           {isCooking ? (
             <span className="inline-block px-4 py-1 bg-chef-500 text-white rounded-full font-bold text-sm animate-pulse shadow-lg">
               {resolvedMethod ? (HEAT_DETAILS[resolvedMethod as HeatMethod]?.label || PREP_DETAILS[resolvedMethod as PrepMethod]?.label || "COOKING") : "COOKING"} IN PROGRESS...
             </span>
           ) : (
             <span className="inline-block px-4 py-1 bg-white/80 text-stone-600 rounded-full font-bold text-xs shadow-sm uppercase tracking-wider">
               Station: {visuals.label}
             </span>
           )}
        </div>

        <div className="flex-1 flex items-center justify-center w-full z-10 transition-all duration-500 mt-8">
            <div className={`${visuals.container} ${visuals.containerAnim} transition-all duration-500`}>
                {visuals.handleLeft && <div className={visuals.handleLeft}></div>}
                {visuals.handleRight && <div className={visuals.handleRight}></div>}
                {visuals.handleBottom && <div className={visuals.handleBottom}></div>}
                {visuals.base && <div className={visuals.base}></div>}

                <div className={visuals.inner}>
                    {visuals.overlay && <div className={`${visuals.overlay} z-20`}></div>}
                    
                    <CookingEffects 
                        isCooking={isCooking} 
                        activeAnimationMethod={resolvedMethod}
                    />

                    {kitchenItems.length === 0 ? (
                         <div className="text-center text-stone-400 animate-pulse relative z-30">
                            <ChefHat className="w-24 h-24 mx-auto mb-4 opacity-20" />
                            <p className="font-display text-2xl text-stone-400/60 font-bold">Drop ingredients here</p>
                        </div>
                    ) : (
                        <StationIngredients
                            items={kitchenItems}
                            mode={derivedMode}
                            isCooking={isCooking}
                            activeAnimationMethod={resolvedMethod}
                            cookingProgress={0}
                            language={language}
                            onRemoveItem={handleRemoveItem}
                        />
                    )}
                </div>
                
                <CookingSteam 
                   isCooking={isCooking} 
                   activeAnimationMethod={resolvedMethod} 
                   cookingProgress={0} 
                />
            </div>
        </div>
    </div>
  );
};
