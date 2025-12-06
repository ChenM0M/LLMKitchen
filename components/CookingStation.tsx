import React from 'react';
import { Ingredient, PrepMethod, HeatMethod, DishResult, Customer, AnyCookingMethod, Language } from '../types';
import { HistoryStrip } from './station/HistoryStrip';
import { ManualCookingControls } from './station/ManualCookingControls';
import { UnifiedStationVisuals } from './station/UnifiedStationVisuals';

interface CookingStationProps {
  selectedIngredients: Ingredient[];
  selectedSeasonings: Ingredient[];
  selectedPrep: PrepMethod | null;
  selectedHeat: HeatMethod | null;
  onRemoveIngredient: (ingredient: Ingredient) => void;
  onRemoveSeasoning: (ingredient: Ingredient) => void;
  onSelectPrep: (method: PrepMethod) => void;
  onSelectHeat: (method: HeatMethod) => void;
  onCook: () => void;
  isCooking: boolean;
  history: DishResult[];
  onShowHistory: (dish: DishResult) => void;
  currentCustomer: Customer | null;
  isLoadingCustomer?: boolean;
  activeCookingMethod?: AnyCookingMethod | null;
  language: Language;
}

export const CookingStation: React.FC<CookingStationProps> = ({
  selectedIngredients,
  selectedSeasonings,
  selectedPrep,
  selectedHeat,
  onRemoveIngredient,
  onRemoveSeasoning,
  onSelectPrep,
  onSelectHeat,
  onCook,
  isCooking,
  history,
  onShowHistory,
  currentCustomer,
  isLoadingCustomer = false,
  activeCookingMethod,
  language
}) => {
  const canCook = selectedIngredients.length > 0;

  // Visual Priority: active animation > selected heat > selected prep
  const resolvedMethod = (isCooking && activeCookingMethod) 
    ? activeCookingMethod 
    : (selectedHeat || selectedPrep);

  return (
    <div className="flex flex-col min-h-full gap-4 pb-4">
      
      {/* Visuals Area */}
      <UnifiedStationVisuals
         selectedIngredients={selectedIngredients}
         selectedSeasonings={selectedSeasonings}
         resolvedMethod={resolvedMethod}
         isCooking={isCooking}
         onRemoveIngredient={onRemoveIngredient}
         onRemoveSeasoning={onRemoveSeasoning}
         language={language}
         currentCustomer={currentCustomer}
         isLoadingCustomer={isLoadingCustomer}
      />

      {/* Control Panel */}
      <ManualCookingControls 
         selectedPrep={selectedPrep}
         selectedHeat={selectedHeat}
         onSelectPrep={onSelectPrep}
         onSelectHeat={onSelectHeat}
         onCook={onCook}
         isCooking={isCooking}
         canCook={canCook}
      />

      {/* History Section */}
      <HistoryStrip 
         history={history} 
         onShowHistory={onShowHistory} 
      />

    </div>
  );
};