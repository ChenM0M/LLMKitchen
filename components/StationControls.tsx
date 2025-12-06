
import React from 'react';
import { PrepMethod, HeatMethod, MixMethod, AnyCookingMethod, Language, Theme } from '../types';
import { PREP_DETAILS, HEAT_DETAILS, MIX_DETAILS } from '../constants';
import { Droplets, Sparkles, AlertCircle, HandPlatter } from 'lucide-react';
import { t } from '../translations';

interface StationControlsProps {
    mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR';
    theme: Theme;
    language: Language;
    isCooking: boolean;
    isSubmitting: boolean;
    activeAnimationMethod?: AnyCookingMethod | null;

    // Prep
    prepItemCount: number;
    onPrepAction: (method: PrepMethod) => void;

    // Marinate
    canMarinate: boolean;
    onMarinateAction: () => void;

    // Bar
    canBar: boolean;
    selectedMix: MixMethod | null;
    onSelectMix: (method: MixMethod) => void;

    // Cook
    canCook: boolean;
    selectedHeat: HeatMethod | 'raw' | null;
    onSelectHeat: (method: HeatMethod | 'raw') => void;

    // Handler for big button (Start/Stop/Serve)
    onCookClick: () => void;
}

export const StationControls: React.FC<StationControlsProps> = ({
    mode,
    theme,
    language,
    isCooking,
    isSubmitting,
    activeAnimationMethod,
    prepItemCount,
    onPrepAction,
    canMarinate,
    onMarinateAction,
    canBar,
    selectedMix,
    onSelectMix,
    canCook,
    selectedHeat,
    onSelectHeat,
    onCookClick
}) => {
    const isZh = language === 'zh';
    const isJapanese = theme === 'japanese';

    const availablePrepMethods = Object.values(PrepMethod).filter(m => m !== PrepMethod.MARINATE);

    return (
        <div className={`mx-1.5 xs:mx-2 sm:mx-3 md:mx-4 mb-1 p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border shadow-sm
         ${isJapanese ? 'bg-white border-stone-200' : 'bg-stone-100 border-stone-200'}
      `}>

            {/* PREP CONTROLS */}
            {mode === 'PREP' && (
                <div className="station-controls-grid grid grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2 md:gap-3">
                    {availablePrepMethods.map((method) => {
                        const info = PREP_DETAILS[method];
                        const Icon = info.icon;
                        return (
                            <button
                                key={method}
                                onClick={() => onPrepAction(method)}
                                disabled={prepItemCount === 0 || isCooking || isSubmitting}
                                className={`
                                station-btn flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-11 xs:h-12 sm:h-16 md:h-20 rounded-lg sm:rounded-xl transition-all border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-1 relative
                                ${prepItemCount > 0 && !isCooking
                                        ? `bg-white border-stone-300 text-stone-700 hover:bg-stone-50 shadow-sm`
                                        : 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
                                    }
                            `}
                            >
                                <Icon size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase leading-tight">{isZh ? info.labelZh || info.label : info.label}</span>
                                <div className="absolute top-1 left-1 right-1 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-lg pointer-events-none"></div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* MARINATE CONTROLS */}
            {mode === 'MARINATE' && (
                <button
                    onClick={onMarinateAction}
                    disabled={!canMarinate || isCooking || isSubmitting}
                    className={`
                    station-action-btn w-full py-2 xs:py-2.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-2xl shadow-lg transition-all transform flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group flex-shrink-0 border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-1
                    ${canMarinate && !isCooking
                            ? `bg-gradient-to-r ${isJapanese ? 'from-jp-indigo to-indigo-900 border-jp-800 font-serif' : 'from-amber-500 to-amber-600 border-amber-800 font-display'} text-white hover:shadow-xl`
                            : 'bg-stone-300 text-stone-400 border-stone-400 cursor-not-allowed'
                        }
                `}
                >
                    {isCooking ? (
                        <span className="tracking-widest drop-shadow-md animate-pulse">{t('working', language)}</span>
                    ) : (
                        <>
                            <Droplets size={18} className="sm:w-5 sm:h-5 md:w-7 md:h-7 group-hover:animate-bounce" />
                            <span className={`drop-shadow-md ${isJapanese ? '' : 'font-black'}`}>{t('mixAndMarinate', language)}</span>
                        </>
                    )}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none"></div>
                </button>
            )}

            {/* BAR CONTROLS */}
            {mode === 'BAR' && (
                <div className="flex flex-col gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
                    <div className="station-controls-grid grid grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2">
                        {Object.values(MixMethod).map((method) => {
                            const info = MIX_DETAILS[method];
                            const Icon = info.icon;
                            const isSelected = selectedMix === method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => onSelectMix(method)}
                                    disabled={isCooking || isSubmitting}
                                    className={`
                                    station-btn flex flex-col items-center justify-center gap-0.5 h-11 xs:h-12 sm:h-16 md:h-20 rounded-lg sm:rounded-xl transition-all border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-1 relative
                                    ${isSelected
                                            ? `bg-${info.color.replace('bg-', '')} text-white border-black/20 shadow-md scale-105 z-10`
                                            : 'bg-stone-200 text-stone-500 border-stone-300 hover:bg-stone-100'
                                        }
                                    ${isCooking ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                >
                                    {isCooking && activeAnimationMethod === method ? <Sparkles className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Icon size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center px-0.5 leading-tight">{isZh ? info.labelZh || info.label : info.label}</span>
                                    {isSelected && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none rounded-t-lg sm:rounded-t-xl"></div>}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={onCookClick}
                        disabled={isSubmitting || (!canBar && !isCooking)}
                        className={`
                        station-action-btn w-full py-2 xs:py-2.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-2xl shadow-lg transition-all transform flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group flex-shrink-0 border-b-3 sm:border-b-[6px] active:border-b-0 active:translate-y-1.5
                        ${isSubmitting
                                ? 'bg-stone-700 text-white border-stone-900 cursor-not-allowed opacity-90'
                                : isCooking
                                    ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white border-purple-900 hover:brightness-110'
                                    : (canBar
                                        ? `bg-gradient-to-br text-white hover:brightness-110 ${isJapanese ? 'from-jp-indigo to-indigo-900 border-jp-800' : 'from-purple-500 to-purple-600 border-purple-800'}`
                                        : 'bg-stone-300 text-stone-400 border-stone-400 cursor-not-allowed')
                            }
                    `}
                    >
                        {isSubmitting ? (
                            <>
                                <Sparkles className="animate-spin w-5 h-5 sm:w-7 sm:h-7 text-stone-300" />
                                <span className="tracking-widest drop-shadow-md">{t('analyzing', language)}</span>
                            </>
                        ) : isCooking ? (
                            <>
                                <AlertCircle className="animate-pulse text-yellow-300 w-5 h-5 sm:w-7 sm:h-7" />
                                <span className="tracking-widest drop-shadow-md">{isZh ? '停止！' : 'STOP!'}</span>
                            </>
                        ) : (
                            <>
                                <span className="group-hover:animate-bounce text-xl sm:text-3xl">🍸</span>
                                <span className={`drop-shadow-md ${isJapanese ? 'font-serif' : 'font-display font-black'}`}>{t('mixAndServe', language)}</span>
                            </>
                        )}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none"></div>
                    </button>
                </div>
            )}

            {/* COOK CONTROLS */}
            {mode === 'COOK' && (
                <div className="flex flex-col gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
                    <div className="station-controls-grid grid grid-cols-4 gap-1 xs:gap-1.5 sm:gap-2">
                        {Object.values(HeatMethod).map((method) => {
                            const info = HEAT_DETAILS[method];
                            const Icon = info.icon;
                            const isSelected = selectedHeat === method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => onSelectHeat(method)}
                                    disabled={isCooking || isSubmitting}
                                    className={`
                                    station-btn flex flex-col items-center justify-center gap-0.5 h-11 xs:h-12 sm:h-16 md:h-20 rounded-lg sm:rounded-xl transition-all border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-1 relative
                                    ${isSelected
                                            ? `bg-${info.color.replace('bg-', '')} text-white border-black/20 shadow-md scale-105 z-10`
                                            : 'bg-stone-200 text-stone-500 border-stone-300 hover:bg-stone-100'
                                        }
                                    ${isCooking ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                >
                                    {isCooking && activeAnimationMethod === method ? <Sparkles className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Icon size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center px-0.5 leading-tight">{isZh ? info.labelZh || info.label : info.label}</span>
                                    {isSelected && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none rounded-t-lg sm:rounded-t-xl"></div>}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onSelectHeat('raw')}
                            disabled={isCooking || isSubmitting}
                            className={`
                            station-btn flex flex-col items-center justify-center gap-0.5 h-11 xs:h-12 sm:h-16 md:h-20 rounded-lg sm:rounded-xl transition-all border-b-2 sm:border-b-4 active:border-b-0 active:translate-y-1 relative
                            ${selectedHeat === 'raw'
                                    ? `bg-teal-600 text-white border-teal-800 shadow-md scale-105 z-10`
                                    : 'bg-stone-200 text-stone-500 border-stone-300 hover:bg-stone-100'
                                }
                            ${isCooking ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        >
                            <HandPlatter size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center px-0.5 leading-tight">{t('serveRaw', language)}</span>
                            {selectedHeat === 'raw' && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none rounded-t-lg sm:rounded-t-xl"></div>}
                        </button>
                    </div>

                    <button
                        onClick={onCookClick}
                        disabled={isSubmitting || ((!canCook || (isCooking && selectedHeat === 'raw')) && !isCooking)}
                        className={`
                        station-action-btn w-full py-2 xs:py-2.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-2xl shadow-lg transition-all transform flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group flex-shrink-0 border-b-3 sm:border-b-[6px] active:border-b-0 active:translate-y-1.5
                        ${isSubmitting
                                ? 'bg-stone-700 text-white border-stone-900 cursor-not-allowed opacity-90'
                                : isCooking
                                    ? 'bg-gradient-to-br from-red-600 to-red-800 text-white border-red-900 hover:brightness-110'
                                    : (canCook
                                        ? `bg-gradient-to-br text-white hover:brightness-110 ${isJapanese ? 'from-jp-indigo to-indigo-900 border-jp-800' : 'from-red-500 to-red-600 border-red-800'}`
                                        : 'bg-stone-300 text-stone-400 border-stone-400 cursor-not-allowed')
                            }
                    `}
                    >
                        {isSubmitting ? (
                            <>
                                <Sparkles className="animate-spin w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-stone-300" />
                                <span className="tracking-widest drop-shadow-md text-sm sm:text-base md:text-xl">
                                    {t('analyzing', language)}
                                </span>
                            </>
                        ) : isCooking ? (
                            <>
                                <AlertCircle className="animate-pulse text-yellow-300 w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
                                <span className="tracking-widest drop-shadow-md text-sm sm:text-base md:text-xl">
                                    {isZh ? '停止！' : 'STOP!'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="group-hover:animate-bounce text-lg sm:text-xl md:text-3xl">
                                    {selectedHeat === 'raw' ? '🛎️' : '🔥'}
                                </span>
                                <span className={`drop-shadow-md ${isJapanese ? 'font-serif' : 'font-display font-black'}`}>
                                    {selectedHeat === 'raw' ? (isZh ? '直接上菜' : 'SERVE NOW!') : (isZh ? '开始烹饪' : "LET'S COOK!")}
                                </span>
                            </>
                        )}

                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl"></div>
                    </button>
                </div>
            )}
        </div>
    );
};
