
import React, { useMemo } from 'react';
import { KitchenItem, HeatMethod, MixMethod, AnyCookingMethod, Language, GameMode, Theme, Customer } from '../types';
import { CustomerTicket } from './CustomerTicket';
import { t } from '../translations';
import { getContainerVisuals, getMarinadeLiquidStyle } from '../utils/stationUtils';
import { StationBackground } from './station/StationBackground';
import { CookingProgressBar } from './station/CookingProgressBar';
import { CookingEffects, CookingSteam } from './station/CookingEffects';
import { StationIngredients } from './station/StationIngredients';

interface StationVisualsProps {
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR';
  theme: Theme;
  language: Language;
  activeAnimationMethod?: AnyCookingMethod | null;
  selectedHeat: HeatMethod | 'raw' | null;
  selectedMix: MixMethod | null;
  cookingProgress: number;
  cookingStartTime?: number; // Added start time for smooth animation
  isCooking: boolean;
  isSubmitting: boolean;
  
  // Items
  potItems: KitchenItem[];
  prepItems: KitchenItem[];
  marinateItems: KitchenItem[];
  barItems: KitchenItem[];
  onRemoveItem: (item: KitchenItem, from: 'PREP' | 'MARINATE' | 'COOK' | 'BAR') => void;

  // Customer Ticket
  currentCustomer: Customer | null;
  isLoadingCustomer?: boolean;
  timeLeft: number;
  gameMode: GameMode | null;
}

export const StationVisuals: React.FC<StationVisualsProps> = ({
  mode,
  theme,
  language,
  activeAnimationMethod,
  selectedHeat,
  selectedMix,
  cookingProgress,
  cookingStartTime,
  isCooking,
  isSubmitting,
  potItems,
  prepItems,
  marinateItems,
  barItems,
  onRemoveItem,
  currentCustomer,
  isLoadingCustomer,
  timeLeft,
  gameMode
}) => {
  const isZh = language === 'zh';
  const isJapanese = theme === 'japanese';

  // Get container configurations (classes, labels)
  const visuals = getContainerVisuals(
    mode, 
    activeAnimationMethod, 
    selectedHeat, 
    selectedMix, 
    isCooking, 
    isZh, 
    theme
  );

  // Calculate liquid style for marinade if applicable
  const marinadeLiquidStyle = useMemo(() => {
    return getMarinadeLiquidStyle(mode, marinateItems, activeAnimationMethod, isCooking);
  }, [marinateItems, mode, isCooking, activeAnimationMethod]);

  // Determine which items to show
  let itemsToShow: KitchenItem[] = [];
  if (mode === 'PREP') itemsToShow = prepItems;
  else if (mode === 'MARINATE') itemsToShow = marinateItems;
  else if (mode === 'BAR') itemsToShow = barItems;
  else itemsToShow = potItems;

  return (
      <div className={`flex-1 rounded-3xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border-4 p-2 sm:p-6 flex flex-col items-center relative overflow-hidden min-h-[220px] sm:min-h-[300px] mx-2 sm:mx-4 transition-colors duration-500
          ${isJapanese ? 'border-[#e2dccc]' : 'border-[#e5e7eb]'}
      `}>
        
        {/* DYNAMIC BACKGROUND */}
        <StationBackground mode={mode} theme={theme} />

        {/* CUSTOMER TICKET */}
        {!isCooking && (
          <CustomerTicket 
            customer={currentCustomer} 
            isLoading={isLoadingCustomer} 
            language={language} 
            gameMode={gameMode} 
            timeLeft={timeLeft} 
          />
        )}

        {/* COOKING PROGRESS BAR */}
        <CookingProgressBar
            mode={mode}
            selectedHeat={selectedHeat}
            cookingProgress={cookingProgress}
            cookingStartTime={cookingStartTime}
            isCooking={isCooking}
            isSubmitting={isSubmitting}
            language={language}
        />

        {/* STATUS BADGE */}
        {(!isCooking || (mode === 'COOK' && selectedHeat === 'raw') || mode === 'PREP' || mode === 'MARINATE') && (
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-1 sm:py-2 rounded-b-xl font-mono text-[10px] sm:text-xs shadow-md border-x-2 border-b-2 z-10 transition-colors
                ${isJapanese 
                    ? 'bg-stone-800 text-stone-200 border-stone-700' 
                    : 'bg-stone-800 text-green-400 border-stone-600'}
            `}>
                <span className={`tracking-widest uppercase ${isCooking ? 'animate-pulse' : ''}`}>
                {isSubmitting ? 'ANALYZING' : (isCooking ? t('working', language) : visuals.label)}
                </span>
            </div>
        )}

        {/* MAIN CONTAINER */}
        <div className="flex-1 flex items-center justify-center w-full z-10 mt-6 sm:mt-8">
            <div className={`transition-all duration-500 origin-center transform scale-[0.8] sm:scale-100 ${visuals.container} ${visuals.containerAnim}`}>
                {visuals.topLid && <div className="absolute -top-10 w-[80%] h-12 bg-inherit border-4 border-slate-300 rounded-t-2xl z-30 shadow-lg"></div>}
                {visuals.handleLeft && <div className={visuals.handleLeft}></div>}
                {visuals.handleRight && <div className={visuals.handleRight}></div>}
                {visuals.handleBottom && <div className={visuals.handleBottom}></div>}
                {visuals.base && <div className={visuals.base}></div>}
                
                {/* Marinade Liquid Layer */}
                {mode === 'MARINATE' && marinadeLiquidStyle.height && (
                    <div 
                        className={`absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ${marinadeLiquidStyle.className || 'bg-amber-100'}`}
                        style={{ height: marinadeLiquidStyle.height }}
                    ></div>
                )}

                <div className={visuals.inner}>
                    {visuals.overlay && <div className={`${visuals.overlay} z-20`}></div>}
                    
                    <CookingEffects 
                        isCooking={isCooking} 
                        activeAnimationMethod={activeAnimationMethod} 
                        marinadeLiquidStyle={marinadeLiquidStyle} 
                        cookingProgress={cookingProgress}
                    />
                    
                    <StationIngredients
                        items={itemsToShow}
                        mode={mode}
                        isCooking={isCooking}
                        activeAnimationMethod={activeAnimationMethod}
                        cookingProgress={cookingProgress}
                        language={language}
                        onRemoveItem={onRemoveItem}
                    />
                </div>
                
                <CookingSteam 
                   isCooking={isCooking} 
                   activeAnimationMethod={activeAnimationMethod} 
                   cookingProgress={cookingProgress} 
                />
            </div>
        </div>

      </div>
  );
};
