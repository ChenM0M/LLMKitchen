
import React from 'react';
import { AnyCookingMethod, HeatMethod, PrepMethod, MixMethod } from '../../types';
import { COOKING_CONSTANTS } from '../../constants';

interface CookingEffectsProps {
  isCooking: boolean;
  activeAnimationMethod: AnyCookingMethod | null | undefined;
  cookingProgress?: number;
  marinadeLiquidStyle?: { className?: string };
}

export const CookingSteam: React.FC<CookingEffectsProps> = ({ isCooking, activeAnimationMethod, cookingProgress = 0 }) => {
    if (!isCooking) return null;
    
    if (activeAnimationMethod === HeatMethod.BOIL || activeAnimationMethod === HeatMethod.FRY || activeAnimationMethod === HeatMethod.BAKE || activeAnimationMethod === PrepMethod.AIR_DRY) {
        
        const isBurnt = cookingProgress > COOKING_CONSTANTS.PERFECT_END;
        
        return (
           <>
              <div className={`absolute -top-16 left-1/3 w-8 h-20 blur-2xl animate-steam opacity-0 z-30 pointer-events-none ${isBurnt ? 'bg-stone-800' : 'bg-white'}`}></div>
              <div className={`absolute -top-12 left-1/2 w-12 h-24 blur-2xl animate-steam opacity-0 animation-delay-500 z-30 pointer-events-none ${isBurnt ? 'bg-stone-900' : 'bg-white'}`} style={{ animationDelay: '0.5s'}}></div>
              <div className={`absolute -top-16 right-1/3 w-10 h-16 blur-2xl animate-steam opacity-0 animation-delay-1000 z-30 pointer-events-none ${isBurnt ? 'bg-black' : 'bg-white'}`} style={{ animationDelay: '1s'}}></div>
           </>
        );
    }
    return null;
};

export const CookingEffects: React.FC<CookingEffectsProps> = ({ isCooking, activeAnimationMethod, marinadeLiquidStyle }) => {
    if (!isCooking) return null;

    if (activeAnimationMethod === HeatMethod.BOIL) {
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[inherit]">
          {[...Array(12)].map((_, i) => (
             <div 
               key={i} 
               className="absolute bg-white/40 rounded-full animate-bubble-rise"
               style={{
                 left: `${Math.random() * 80 + 10}%`,
                 width: `${Math.random() * 20 + 5}px`,
                 height: `${Math.random() * 20 + 5}px`,
                 animationDelay: `${Math.random() * 2}s`,
                 animationDuration: `${1 + Math.random()}s`
               }}
             />
          ))}
           <div className="absolute -top-10 left-1/2 w-32 h-32 bg-white/20 blur-3xl rounded-full animate-pulse"></div>
        </div>
      );
    }

    if (activeAnimationMethod === HeatMethod.FRY) {
      return (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(8)].map((_, i) => (
             <div 
               key={i} 
               className="absolute bg-yellow-200 rounded-full animate-oil-pop"
               style={{
                 left: `${Math.random() * 60 + 20}%`,
                 top: `${Math.random() * 60 + 20}%`,
                 width: `${Math.random() * 8 + 4}px`,
                 height: `${Math.random() * 8 + 4}px`,
                 animationDelay: `${Math.random() * 0.5}s`
               }}
             />
          ))}
        </div>
      );
    }

    if (activeAnimationMethod === PrepMethod.CHOP) {
      return (
        <>
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none -translate-y-8 translate-x-4">
                <div className="text-6xl sm:text-8xl filter drop-shadow-xl animate-knife-cut origin-bottom-right transform">
                    🔪
                </div>
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none">
                 {[...Array(6)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-chef-200 w-2 h-2 rounded-sm animate-oil-pop"
                        style={{
                            left: '50%',
                            top: '50%',
                            animationDelay: `${Math.random() * 0.3}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    />
                 ))}
            </div>
        </>
      );
    }

    if (activeAnimationMethod === PrepMethod.BLEND) {
        return (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/30 to-transparent z-20 pointer-events-none">
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/10 blur-md rounded-full animate-pulse"></div>
            </div>
        );
    }

    if (activeAnimationMethod === PrepMethod.MARINATE) {
        return (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-full bg-white/10 blur-md animate-pulse"></div>
                 {[...Array(5)].map((_, i) => (
                    <div 
                        key={i}
                        className={`absolute w-3 h-3 rounded-full animate-oil-pop ${marinadeLiquidStyle?.className || 'bg-amber-500'}`}
                        style={{
                            left: `${40 + Math.random() * 20}%`,
                            top: `${40 + Math.random() * 20}%`,
                            animationDelay: `${Math.random() * 0.5}s`
                        }}
                    />
                 ))}
            </div>
        );
    }

    if (activeAnimationMethod === MixMethod.SHAKE) {
        return (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="absolute w-full h-full bg-white/20 blur-sm animate-pulse"></div>
                 {[...Array(5)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-6 h-6 bg-white/40 border border-white/60 rounded-sm animate-shake"
                        style={{
                            left: `${30 + Math.random() * 40}%`,
                            top: `${30 + Math.random() * 40}%`,
                            animationDelay: `${Math.random() * 0.2}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    />
                 ))}
            </div>
        );
    }
    
    if (activeAnimationMethod === PrepMethod.AIR_DRY) {
        return (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-lg">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute h-0.5 bg-white/60 blur-[1px] rounded-full animate-steam"
                        style={{
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${20 + Math.random() * 60}%`,
                            width: `${30 + Math.random() * 50}px`,
                            animationDuration: '0.8s',
                            animationDelay: `${Math.random() * 0.5}s`,
                            transform: 'rotate(90deg)'
                        }}
                    />
                ))}
            </div>
        );
    }

    return null;
};
