
import React, { useMemo } from 'react';
import { Theme } from '../../types';

interface StationBackgroundProps {
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR';
  theme: Theme;
}

// --- Helper Components ---

const BottlesRow = ({ count, rowIndex, theme }: { count: number, rowIndex: number, theme: Theme }) => {
    // Generate random bottles with stable values
    const bottles = useMemo(() => {
        const colors = theme === 'japanese' 
            ? ['bg-amber-700', 'bg-emerald-900', 'bg-stone-800', 'bg-amber-100/80', 'bg-orange-900', 'bg-white/90', 'bg-stone-900'] 
            : ['bg-red-500', 'bg-emerald-500', 'bg-amber-400', 'bg-sky-500', 'bg-purple-500', 'bg-rose-400', 'bg-slate-300'];
        
        return Array.from({ length: count }).map((_, i) => ({
           height: 35 + Math.random() * 55, // % of shelf height
           width: 12 + Math.random() * 16, // px
           color: colors[Math.floor(Math.random() * colors.length)],
           shape: Math.random() > 0.7 ? 'rounded-t-sm' : (Math.random() > 0.4 ? 'rounded-t-xl' : 'rounded-t-full'),
           opacity: 0.5 + Math.random() * 0.5,
           margin: 2 + Math.random() * 8
       }));
    }, [count, theme]);

    return (
        <div className="flex items-end justify-center w-full h-full pb-1 relative z-10">
            {bottles.map((b, i) => (
               <div 
                 key={i} 
                 className={`relative flex-shrink-0 ${b.color} ${b.shape} backdrop-blur-[1px] transition-all duration-1000 transform hover:scale-105`} 
                 style={{ 
                     height: `${b.height}%`, 
                     width: `${b.width}px`, 
                     opacity: b.opacity,
                     marginLeft: `${b.margin}px`,
                     marginRight: `${b.margin}px`,
                     boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.4)'
                 }}
               >
                   {/* Highlight */}
                   <div className="absolute top-[10%] left-[10%] w-[20%] h-[40%] bg-white/40 rounded-full blur-[0.5px]"></div>
               </div>
            ))}
        </div>
    );
};

const PlantShadow = () => (
    <div className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 pointer-events-none blur-[2px] animate-wave-slow origin-bottom-right text-stone-900 z-20">
         <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
            <path d="M100,200 C120,150 150,120 190,100 C180,120 170,150 180,200 Z" />
            <path d="M100,200 C80,140 40,100 10,80 C30,110 50,150 60,200 Z" />
            <path d="M100,200 C100,120 100,60 110,10 C115,50 115,120 120,200 Z" />
         </svg>
    </div>
);

// --- Main Component ---

const StationBackgroundComponent: React.FC<StationBackgroundProps> = ({ mode, theme }) => {
  const isJapanese = theme === 'japanese';

  // 1. BAR STATION
  if (mode === 'BAR') {
    return (
      <div className={`absolute inset-0 z-0 overflow-hidden transition-colors duration-500 
          ${isJapanese ? 'bg-[#1a1714]' : 'bg-[#0f172a]'}`}>
          
          {/* Subtle Wallpaper Texture */}
          <div className="absolute inset-0 opacity-20"
               style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
          </div>

          {/* Shelves */}
          <div className="absolute top-0 left-0 right-0 h-[70%] flex flex-col pt-6 gap-12 px-6 sm:px-16 opacity-90">
              
              {/* Shelf 1 */}
              <div className="w-full h-20 relative border-b-[6px] border-[#000000]/60 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                   <BottlesRow count={isJapanese ? 6 : 9} rowIndex={0} theme={theme} />
                   {/* Under-shelf Glow */}
                   <div className={`absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-b ${isJapanese ? 'from-amber-500/10' : 'from-purple-500/20'} to-transparent blur-xl`}></div>
              </div>

              {/* Shelf 2 (Hidden on very small screens if needed, but mostly visible) */}
              <div className="w-full h-20 relative border-b-[6px] border-[#000000]/60 shadow-[0_10px_20px_rgba(0,0,0,0.5)] hidden sm:block">
                   <BottlesRow count={isJapanese ? 8 : 12} rowIndex={1} theme={theme} />
                    <div className={`absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-b ${isJapanese ? 'from-amber-500/10' : 'from-blue-500/20'} to-transparent blur-xl`}></div>
              </div>
          </div>

          {/* Ambient Lighting / Neon */}
          {isJapanese ? (
              <div className="absolute top-4 right-4 opacity-40">
                 <div className="w-16 h-16 rounded-full bg-red-600 blur-[40px] animate-pulse"></div>
              </div>
          ) : (
              <div className="absolute top-[10%] left-[10%] opacity-30">
                 {/* Neon sign imitation */}
                 <div className="w-32 h-2 bg-pink-500 blur-[8px] rotate-[-5deg] shadow-[0_0_10px_#ec4899]"></div>
                 <div className="w-32 h-2 bg-blue-500 blur-[8px] rotate-[-5deg] mt-2 shadow-[0_0_10px_#3b82f6]"></div>
              </div>
          )}

          {/* Bar Counter Surface Reflection */}
          <div className="absolute bottom-0 w-full h-[25%] bg-gradient-to-b from-white/5 to-black/90 backdrop-blur-[1px] border-t border-white/5">
              {/* Simulated reflection of environment */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-30"></div>
          </div>
          
          {/* Floating Dust Particles */}
          <div className="absolute inset-0 pointer-events-none">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white/40 blur-[1px] animate-twinkle"
                     style={{
                         left: `${Math.random() * 100}%`,
                         top: `${Math.random() * 80}%`,
                         width: `${Math.random() * 2}px`,
                         height: `${Math.random() * 2}px`,
                         animationDelay: `${Math.random() * 5}s`
                     }}></div>
             ))}
          </div>
      </div>
    );
  }

  // 2. COOK STATION (Industrial)
  if (mode === 'COOK') {
    return (
      <div className={`absolute inset-0 z-0 overflow-hidden transition-colors duration-500 
         ${isJapanese ? 'bg-[#292524]' : 'bg-[#334155]'}`}>
          
          {/* Brushed Metal Texture */}
          <div className="absolute inset-0 opacity-30" 
               style={{ 
                   backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px), repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px)`,
                   backgroundSize: '100% 100%' 
               }}>
          </div>
          
          {/* Backsplash Grate */}
          <div className="absolute top-[20%] bottom-[30%] left-0 right-0 opacity-10"
               style={{ 
                   backgroundImage: `radial-gradient(circle, #000 2px, transparent 2.5px)`,
                   backgroundSize: '16px 16px' 
               }}>
          </div>

          {/* Vent Hood Shadow */}
          <div className="absolute top-0 left-0 w-full h-[35%] bg-gradient-to-b from-black/70 via-black/40 to-transparent z-10 pointer-events-none"></div>

          {/* Stove Glow */}
          <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-orange-600/30 via-orange-500/10 to-transparent z-10 animate-pulse-glow"></div>
          
          {/* Embers */}
          <div className="absolute bottom-0 inset-x-0 h-1/2 overflow-hidden pointer-events-none z-10">
              {[...Array(6)].map((_, i) => (
                 <div key={i} className={`absolute rounded-full blur-[1px] animate-rise-slow ${isJapanese ? 'bg-orange-400/60' : 'bg-red-400/40'}`} style={{
                     left: `${Math.random() * 100}%`,
                     width: `${Math.random() * 4 + 2}px`,
                     height: `${Math.random() * 4 + 2}px`,
                     animationDelay: `${Math.random() * 4}s`,
                     animationDuration: `${Math.random() * 3 + 3}s`,
                     bottom: '-10%'
                 }}></div>
              ))}
          </div>

          {/* Counter Lip */}
          <div className="absolute bottom-0 w-full h-4 bg-gradient-to-b from-[#57534e] to-[#292524] border-t border-[#78716c] shadow-[0_-2px_10px_rgba(0,0,0,0.3)] z-20"></div>
      </div>
    );
  }

  // 3. PREP STATION (Daylight)
  if (mode === 'PREP') {
    return (
      <div className={`absolute inset-0 z-0 overflow-hidden transition-colors duration-500 
          ${isJapanese ? 'bg-[#fffbeb]' : 'bg-[#f8fafc]'}`}>
         
         {/* Tiles */}
         <div className="absolute inset-0 opacity-[0.15]" 
             style={{ 
                 backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
                 backgroundSize: '50px 50px',
                 backgroundPosition: 'center'
             }}>
         </div>

         {/* Light Shafts */}
         <div className="absolute -top-[20%] -right-[10%] w-[120%] h-[120%] bg-gradient-to-b from-white via-white/30 to-transparent -rotate-45 blur-2xl opacity-50 pointer-events-none"></div>
         
         <PlantShadow />

         {/* Wooden/Marble Counter Edge */}
         <div className={`absolute bottom-0 w-full h-6 border-t shadow-sm z-10 
             ${isJapanese 
                ? 'bg-[#d6d3d1] border-[#e7e5e4]' // Light stone
                : 'bg-[#f1f5f9] border-[#e2e8f0]' // White Marble
             }`}></div>
      </div>
    );
  }

  // 4. MARINATE STATION (Wet Area)
  if (mode === 'MARINATE') {
    return (
      <div className={`absolute inset-0 z-0 overflow-hidden transition-colors duration-500 
          ${isJapanese ? 'bg-[#cfd3d6]' : 'bg-[#e0f2fe]'}`}>
           
          {/* Mosaic Tiles */}
          <div className="absolute inset-0 opacity-20" 
                style={{ 
                    backgroundImage: `linear-gradient(45deg, #475569 25%, transparent 25%, transparent 75%, #475569 75%, #475569), linear-gradient(45deg, #475569 25%, transparent 25%, transparent 75%, #475569 75%, #475569)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                }}>
           </div>

          {/* Water Caustics (Simulated) */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay animate-wave-slow pointer-events-none"
               style={{
                   background: 'radial-gradient(circle at 50% 120%, #3b82f6, transparent 60%)',
                   transform: 'scaleY(0.7)'
               }}
          ></div>
          
          {/* Faucet Silhouette (Blurred in background) */}
          <div className="absolute -top-12 left-[60%] w-24 h-56 border-l-[12px] border-t-[12px] border-stone-400 rounded-tl-3xl opacity-20 blur-sm pointer-events-none"></div>

          {/* Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                 <div key={i} className="absolute border border-blue-400/50 bg-white/30 rounded-full animate-rise-slow" style={{
                     left: `${Math.random() * 80 + 10}%`,
                     width: `${Math.random() * 10 + 4}px`,
                     height: `${Math.random() * 10 + 4}px`,
                     animationDelay: `${Math.random() * 5}s`,
                     bottom: '-10%'
                 }}></div>
              ))}
          </div>

          {/* Counter Edge */}
          <div className="absolute bottom-0 w-full h-6 bg-gradient-to-b from-white/60 to-slate-200 border-t border-white/50 backdrop-blur-md"></div>
      </div>
    );
  }

  return null;
};

export const StationBackground = React.memo(StationBackgroundComponent);
