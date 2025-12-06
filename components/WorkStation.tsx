import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StationSelector } from './StationSelector';
import { PrepStation } from './stations/PrepStation';
import { MarinateStation } from './stations/MarinateStation';
import { CookStation } from './stations/CookStation';
import { BarStation } from './stations/BarStation';
import { SubmitStation } from './stations/SubmitStation';
import { CustomerTicket } from './CustomerTicket';
import { StationParticles } from './ui/StationParticles';
import { KitchenItem, PrepMethod, HeatMethod, MixMethod, DishResult, Customer, AnyCookingMethod, Language, GameMode, Theme } from '../types';

interface WorkStationProps {
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT';
  onSetMode: (mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT') => void;

  // Individual station items
  prepItems: KitchenItem[];
  marinateItems: KitchenItem[];
  barItems: KitchenItem[];
  potItems: KitchenItem[];

  // Prep Station
  onPrepAction: (method: PrepMethod, mode?: 'MERGE' | 'SEPARATE') => void;
  onRemovePrepItem: (item: KitchenItem) => void;

  // Marinate Station
  onMarinateAction: () => void;
  onRemoveMarinateItem: (item: KitchenItem) => void;

  onCook: (precision: any) => void;
  onServe: () => void;
  onStartCooking?: () => void;

  // Bar Station
  selectedMix: MixMethod | null;
  onSelectMix: (method: MixMethod) => void;
  onProcess: (method: MixMethod) => void; // Add this
  onRemoveBarItem: (item: KitchenItem) => void;

  // Global State
  isCooking: boolean;
  isSubmitting?: boolean;
  activeAnimationMethod?: AnyCookingMethod | null;
  language: Language;
  gameMode: GameMode;
  theme: Theme;

  // Customer
  currentCustomer?: Customer | null;
  isLoadingCustomer?: boolean;
  timeLeft?: number;

  // Submit Station
  submitItems: KitchenItem[];
  onSubmit: () => void;
  onRemoveSubmitItem: (item: KitchenItem) => void;
  onClearSubmitItems?: () => void;

  // History
  history?: DishResult[];
  onShowHistory?: (dish: DishResult) => void;
}

export const WorkStation: React.FC<WorkStationProps> = ({
  mode,
  onSetMode,
  prepItems,
  marinateItems,
  barItems,
  potItems,
  submitItems,
  onPrepAction,
  onRemovePrepItem,
  onMarinateAction,
  onRemoveMarinateItem,
  selectedMix,
  onSelectMix,
  onRemoveBarItem,
  selectedHeat,
  onSelectHeat,
  onRemovePotItem, // Fix: Added back to destructuring
  onCook,
  onServe,
  onStartCooking,
  onProcess,
  isCooking,
  isSubmitting,
  activeAnimationMethod,
  language,
  gameMode,
  theme,
  currentCustomer,
  isLoadingCustomer,
  timeLeft,
  onSubmit,
  onRemoveSubmitItem,
  onClearSubmitItems
}) => {
  const isJapanese = theme === 'japanese';

  const renderStation = () => {
    switch (mode) {
      case 'PREP':
        return (
          <PrepStation
            items={prepItems}
            onAction={onPrepAction}
            onRemoveItem={onRemovePrepItem}
            isCooking={isCooking}
            activeAnimationMethod={activeAnimationMethod}
            language={language}
            theme={theme}
          />
        );
      case 'MARINATE':
        return (
          <MarinateStation
            items={marinateItems}
            onAction={onMarinateAction}
            onRemoveItem={onRemoveMarinateItem}
            isCooking={isCooking}
            activeAnimationMethod={activeAnimationMethod}
            language={language}
            theme={theme}
          />
        );
      case 'COOK':
        return (
          <CookStation
            items={potItems}
            onAction={onCook}
            onRemoveItem={onRemovePotItem}
            selectedHeat={selectedHeat}
            onSelectHeat={onSelectHeat}
            isCooking={isCooking}
            isSubmitting={isSubmitting}
            activeAnimationMethod={activeAnimationMethod}
            language={language}
            theme={theme}
          />
        );
      case 'BAR':
        return (
          <BarStation
            items={barItems}
            onProcess={onProcess}
            onRemoveItem={onRemoveBarItem}
            selectedMix={selectedMix}
            onSelectMix={onSelectMix}
            isCooking={isCooking}
            isSubmitting={isSubmitting}
            activeAnimationMethod={activeAnimationMethod}
            language={language}
            theme={theme}
          />
        );
      case 'SUBMIT':
        return (
          <SubmitStation
            items={submitItems}
            onSubmit={onSubmit}
            onRemoveItem={onRemoveSubmitItem}
            onClear={onClearSubmitItems}
            isSubmitting={isSubmitting}
            language={language}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Station Selector Tabs */}
      <StationSelector
        mode={mode}
        onSetMode={onSetMode}
        isCooking={isCooking}
        language={language}
        theme={theme}
      />

      {/* Main Station Area */}
      <div className="flex-1 flex gap-2 sm:gap-4 relative overflow-hidden p-2 sm:p-4">
        {/* Station Content */}
        <div className={`flex-1 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-inner
          ${isJapanese
            ? 'bg-white/70 backdrop-blur-md'
            : mode === 'PREP' ? 'bg-gradient-to-br from-stone-50/90 to-white/80'
              : mode === 'COOK' ? 'bg-gradient-to-br from-orange-50/90 to-amber-50/80'
                : mode === 'MARINATE' ? 'bg-gradient-to-br from-amber-50/90 to-yellow-50/80'
                  : mode === 'BAR' ? 'bg-gradient-to-br from-purple-50/90 to-indigo-50/80'
                    : 'bg-gradient-to-br from-emerald-50/90 to-green-50/80'
          } backdrop-blur-sm
        `}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              className="absolute inset-0 p-2 sm:p-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {renderStation()}
              <StationParticles
                activeMethod={activeAnimationMethod || null}
                colorClass={
                  mode === 'PREP' && prepItems.length > 0 ? prepItems[0].color :
                    mode === 'COOK' && potItems.length > 0 ? potItems[0].color :
                      mode === 'BAR' && barItems.length > 0 ? barItems[0].color :
                        mode === 'MARINATE' && marinateItems.length > 0 ? marinateItems[0].color :
                          undefined
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Customer Ticket (if in Challenge Mode) */}
        {gameMode === 'CHALLENGE' && (
          <div className="w-32 sm:w-48 flex-none">
            <CustomerTicket
              customer={currentCustomer}
              isLoading={isLoadingCustomer}
              timeLeft={timeLeft}
              language={language}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};
