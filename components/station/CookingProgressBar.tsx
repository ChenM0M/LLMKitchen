
import React, { useEffect, useRef } from 'react';
import { HeatMethod, MixMethod, Language } from '../../types';
import { COOKING_CONSTANTS } from '../../constants';
import { Flame, ThumbsUp, CloudFog } from 'lucide-react';

interface CookingProgressBarProps {
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR';
  selectedHeat: HeatMethod | 'raw' | null;
  cookingProgress: number; // Used for labels and fallback
  cookingStartTime?: number; // Used for smooth animation
  isCooking: boolean;
  isSubmitting: boolean;
  language: Language;
}

export const CookingProgressBar: React.FC<CookingProgressBarProps> = ({
  mode,
  selectedHeat,
  cookingProgress,
  cookingStartTime,
  isCooking,
  isSubmitting,
  language
}) => {
  const pointerRef = useRef<HTMLDivElement>(null);

  // Smooth Animation Loop
  useEffect(() => {
    if (isCooking && cookingStartTime) {
        let animId: number;
        
        const update = () => {
           const elapsed = Date.now() - cookingStartTime;
           const p = Math.min(100, (elapsed / COOKING_CONSTANTS.DURATION_MS) * 100);
           
           if (pointerRef.current) {
              pointerRef.current.style.left = `${p}%`;
           }
           
           if (p < 100) {
               animId = requestAnimationFrame(update);
           }
        };
        
        animId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animId);
    } else {
        // Sync with prop when not cooking (e.g. stopped/finished state)
        if (pointerRef.current) {
           pointerRef.current.style.left = `${cookingProgress}%`;
        }
    }
  }, [isCooking, cookingStartTime, cookingProgress]);

  if (!isCooking || isSubmitting) return null;
  
  // Only show for active cook heat (not raw) or bar mixing
  if (!((mode === 'COOK' && selectedHeat !== 'raw') || mode === 'BAR')) return null;

  const isZh = language === 'zh';

  return (
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 sm:w-64 z-50 animate-slide-up">
          <div className="h-6 bg-stone-800 rounded-full border-2 border-white shadow-lg relative">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 bg-blue-500" style={{ width: `${COOKING_CONSTANTS.PERFECT_START}%` }}></div>
                  <div className="absolute top-0 bottom-0 bg-green-500" style={{ left: `${COOKING_CONSTANTS.PERFECT_START}%`, width: `${COOKING_CONSTANTS.PERFECT_END - COOKING_CONSTANTS.PERFECT_START}%` }}>
                      <div className="absolute inset-0 animate-pulse bg-white/20"></div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 bg-red-600" style={{ width: `${100 - COOKING_CONSTANTS.PERFECT_END}%` }}></div>
              </div>
              
              <div 
                  ref={pointerRef}
                  className="absolute -top-1 -bottom-1 w-1.5 bg-white border border-stone-300 shadow-[0_0_5px_rgba(0,0,0,0.5)] z-20 -translate-x-1/2 rounded-full"
                  style={{ left: `${cookingProgress}%` }}
              ></div>
          </div>
          
          <div className="flex justify-between mt-1 text-[10px] font-black uppercase text-stone-600 drop-shadow-sm px-1">
               <span>{mode === 'BAR' ? 'Diluted' : 'Raw'}</span>
               <span className="text-green-700">Perfect</span>
               <span className="text-red-700">{mode === 'BAR' ? 'Watery' : 'Burnt'}</span>
          </div>

          <div className="text-center mt-2">
              {cookingProgress > COOKING_CONSTANTS.PERFECT_END ? (
                   <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                       <Flame size={12} fill="currentColor" /> {isZh ? (mode === 'BAR' ? "水太多！" : "焦了！") : (mode === 'BAR' ? "WATERY!" : "BURNING!")}
                   </div>
              ) : cookingProgress >= COOKING_CONSTANTS.PERFECT_START ? (
                   <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                       <ThumbsUp size={12} /> {isZh ? "完美" : "PERFECT"}
                   </div>
              ) : (
                   <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                       <CloudFog size={12} /> {isZh ? (mode === 'BAR' ? "调制中..." : "加热中...") : (mode === 'BAR' ? "MIXING..." : "HEATING...")}
                   </div>
              )}
          </div>
      </div>
  );
};
