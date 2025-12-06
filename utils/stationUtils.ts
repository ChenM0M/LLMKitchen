
import { HeatMethod, MixMethod, PrepMethod, MarinateMethod, AnyCookingMethod, Theme, KitchenItem } from '../types';

export const getContainerVisuals = (
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR',
  activeAnimationMethod: AnyCookingMethod | null | undefined,
  selectedHeat: HeatMethod | 'raw' | null,
  selectedMix: MixMethod | null,
  isCooking: boolean,
  isZh: boolean,
  theme: Theme
) => {
  const isJapanese = theme === 'japanese';

  // Priority: Animation Method > Selected Method (if cooking/mixing) > Current Mode
  let methodToCheck: AnyCookingMethod | string | null = activeAnimationMethod || null;

  if (!methodToCheck) {
    if (mode === 'COOK' && selectedHeat) methodToCheck = selectedHeat === 'raw' ? 'raw' : selectedHeat;
    if (mode === 'BAR' && selectedMix) methodToCheck = selectedMix;
  }

  // Explicitly handle Marinate animation
  if (activeAnimationMethod === MarinateMethod.MARINATE || mode === 'MARINATE') {
    return {
      container: "bg-white/40 border-4 border-white/60 backdrop-blur-sm shadow-xl w-full max-w-md h-60 sm:h-64 mt-4 sm:mt-8 flex items-end justify-center relative overflow-hidden rounded-b-[5rem] rounded-t-xl ring-1 ring-white/50",
      inner: "w-full h-full flex items-center justify-center relative z-10",
      overlay: "absolute bottom-0 w-full bg-amber-600/30 transition-all duration-1000 ease-in-out",
      label: isZh ? "腌制碗" : "Glass Bowl",
      containerAnim: isCooking ? "animate-shake" : "",
      isGlass: true
    };
  }

  // BAR MODE
  if (mode === 'BAR') {
    if (methodToCheck === MixMethod.SHAKE) {
      return {
        container: "bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border-4 border-slate-300 w-40 sm:w-48 h-64 sm:h-72 mt-4 flex items-center justify-center relative rounded-t-lg rounded-b-3xl shadow-2xl",
        inner: "w-full h-full flex items-center justify-center relative z-10 overflow-hidden",
        overlay: isCooking ? "absolute inset-0 bg-white/30 animate-pulse" : "",
        label: isZh ? "雪克壶" : "Shaker",
        containerAnim: isCooking ? "animate-shake" : "",
        topLid: true
      };
    }
    return {
      container: "bg-white/10 border-4 border-white/30 backdrop-blur-[2px] w-48 sm:w-56 h-64 sm:h-72 mt-4 flex items-end justify-center relative rounded-b-2xl shadow-xl ring-1 ring-white/40",
      inner: "w-full h-full flex items-center justify-center relative z-10 overflow-hidden rounded-b-xl",
      overlay: "absolute bottom-0 w-full h-[80%] bg-blue-400/10 rounded-b-xl",
      label: isZh ? "调酒杯" : "Mixing Glass",
      containerAnim: (isCooking && methodToCheck === MixMethod.STIR) ? "animate-spin-slow origin-center" : "",
      isGlass: true
    };
  }

  // PREP MODE
  if (mode === 'PREP') {
    if (methodToCheck === PrepMethod.BLEND) {
      return {
        container: "bg-transparent w-40 sm:w-48 h-64 sm:h-80 relative flex flex-col items-center justify-end mt-4",
        inner: "w-32 sm:w-40 h-56 sm:h-64 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-b-3xl rounded-t-lg flex items-center justify-center overflow-hidden mb-8 sm:mb-10 relative shadow-2xl z-10",
        overlay: "absolute bottom-0 w-full h-full bg-transparent pointer-events-none",
        base: "absolute bottom-0 w-28 sm:w-36 h-10 sm:h-12 bg-stone-800 rounded-t-xl shadow-xl border-t border-stone-700",
        label: isZh ? "搅拌机" : "Blender",
        containerAnim: isCooking ? "animate-shake" : ""
      };
    }
    if (methodToCheck === PrepMethod.AIR_DRY) {
      return {
        container: "bg-transparent w-full h-full flex items-center justify-center p-2 sm:p-8",
        inner: "w-72 sm:w-96 h-40 sm:h-64 bg-stone-100 rounded-lg shadow-xl border-4 border-stone-300 flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-100 via-stone-200 to-stone-300",
        overlay: "absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_19px,#d6d3d1_20px)] opacity-50",
        base: "",
        label: isZh ? "风干架" : "Drying Rack",
        containerAnim: ""
      };
    }
    // Default Prep (Chop/Idle)
    return {
      container: "bg-transparent w-full h-full flex items-center justify-center p-2 sm:p-8",
      inner: `w-72 sm:w-96 h-40 sm:h-64 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.2),inset_0_0_40px_rgba(0,0,0,0.05)] border-b-8 flex items-center justify-center relative transform rotate-1 
          ${isJapanese ? 'bg-stone-800 border-stone-900 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)]' : 'bg-[#e5cca9] border-[#c5a682] bg-wood'}
      `,
      overlay: "",
      base: "",
      label: isZh ? "砧板" : "Cutting Board",
      containerAnim: (isCooking && methodToCheck === PrepMethod.CHOP) ? "" : ""
    };
  }

  // COOK MODE
  if (methodToCheck === HeatMethod.BOIL) {
    return {
      container: `border-b-8 border-r-8 rounded-b-[4rem] rounded-t-lg relative shadow-2xl w-full max-w-md h-60 sm:h-72 mt-4 transition-all ring-1 ring-white/50
           ${isJapanese ? 'bg-stone-800 border-stone-900' : 'bg-slate-200 border-slate-300 bg-stainless'}
        `,
      inner: "absolute inset-4 bg-blue-400/80 rounded-b-[3.5rem] rounded-t-sm overflow-hidden flex items-center justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)]",
      overlay: "absolute inset-0 bg-blue-500/10 pointer-events-none",
      label: isZh ? "汤锅" : "Stock Pot",
      handleLeft: `absolute -left-4 top-12 w-4 h-16 rounded-l-lg shadow-lg border-r ${isJapanese ? 'bg-stone-700 border-stone-800' : 'bg-slate-300 border-slate-400'}`,
      handleRight: `absolute -right-4 top-12 w-4 h-16 rounded-r-lg shadow-lg border-l ${isJapanese ? 'bg-stone-700 border-stone-800' : 'bg-slate-300 border-slate-400'}`,
      containerAnim: ""
    };
  }
  if (methodToCheck === HeatMethod.FRY) {
    return {
      container: "bg-stone-800 rounded-full border-b-8 border-stone-950 shadow-2xl w-60 sm:w-80 h-60 sm:h-80 flex items-center justify-center relative mt-4 ring-1 ring-stone-700",
      inner: "w-52 sm:w-72 h-52 sm:h-72 rounded-full bg-[#1a1918] flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]",
      overlay: "absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 rounded-full pointer-events-none",
      label: isZh ? "铁锅" : "Iron Skillet",
      handleBottom: "absolute -bottom-20 sm:-bottom-28 left-1/2 -translate-x-1/2 w-8 h-28 sm:h-32 bg-stone-800 rounded-b-lg z-0 shadow-xl border-l border-r border-stone-900",
      containerAnim: isCooking ? "animate-shake" : ""
    };
  }
  if (methodToCheck === HeatMethod.BAKE) {
    return {
      container: `border-8 rounded-xl shadow-2xl w-full max-w-md h-60 sm:h-72 flex items-center justify-center relative overflow-hidden mt-4 
           ${isJapanese ? 'bg-stone-800 border-stone-700' : 'bg-stone-300 border-stone-400 bg-stainless'}
        `,
      inner: "w-full h-full bg-[#2a2522] flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]",
      overlay: isCooking ? "absolute inset-0 bg-orange-500/20 z-20 pointer-events-none animate-pulse-glow" : "absolute inset-0 bg-orange-500/5 z-20 pointer-events-none",
      label: isZh ? "烤箱" : "Oven",
      glow: true,
      containerAnim: ""
    };
  }

  // Default Cook (Raw Pot or Empty)
  return {
    container: `rounded-full border-b-8 shadow-2xl w-60 sm:w-80 h-60 sm:h-80 flex items-center justify-center relative mt-4 opacity-50
        ${isJapanese ? 'bg-jp-800 border-jp-900' : 'bg-stone-800 border-stone-950'}
    `,
    inner: "w-52 sm:w-72 h-52 sm:h-72 rounded-full bg-[#1c1917] flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]",
    overlay: "absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 rounded-full pointer-events-none",
    label: isZh ? "烹饪容器" : "Cooking Vessel",
    handleBottom: `absolute -bottom-20 sm:-bottom-28 left-1/2 -translate-x-1/2 w-8 h-28 sm:h-32 rounded-b-lg z-0 shadow-xl ${isJapanese ? 'bg-jp-800' : 'bg-stone-800'}`,
    containerAnim: ""
  };
};

export const getIngredientAnimClass = (isCooking: boolean, activeAnimationMethod: AnyCookingMethod | null | undefined) => {
  if (!isCooking) return 'animate-float';
  if (activeAnimationMethod === HeatMethod.BOIL) return 'animate-boil';
  if (activeAnimationMethod === HeatMethod.FRY) return 'animate-sizzle brightness-75 sepia-[.4]';
  if (activeAnimationMethod === HeatMethod.BAKE) return 'animate-pulse-glow brightness-50 contrast-125';
  if (activeAnimationMethod === PrepMethod.CHOP) return 'animate-chop';
  if (activeAnimationMethod === PrepMethod.BLEND) return 'animate-spin-fast blur-[2px] opacity-80';
  if (activeAnimationMethod === PrepMethod.AIR_DRY) return 'animate-pulse contrast-125 brightness-110';
  if (activeAnimationMethod === MarinateMethod.MARINATE) return 'animate-shake blur-[0.5px]';
  if (activeAnimationMethod === MixMethod.SHAKE) return 'animate-shake blur-[1px] opacity-80';
  if (activeAnimationMethod === MixMethod.STIR) return 'animate-whirl blur-[0.5px]';
  return '';
};

export const getMarinadeLiquidStyle = (
  mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR',
  marinateItems: KitchenItem[],
  activeAnimationMethod: AnyCookingMethod | null | undefined,
  isCooking: boolean
) => {
  if (mode !== 'MARINATE' && activeAnimationMethod !== MarinateMethod.MARINATE) return {};

  // Check if there are liquid seasonings
  const seasonings = marinateItems.filter(i => i.category === 'seasoning' || i.id === 'milk' || i.id === 'water' || i.id === 'oil');
  if (seasonings.length === 0) return { height: '0%' }; // No liquid

  // Calculate approx color (simple logic)
  const hasDark = seasonings.some(s => ['soysauce', 'vinegar', 'cola'].includes(s.id));
  const hasRed = seasonings.some(s => ['chili', 'fresh_chili', 'ketchup'].includes(s.id));
  const hasYellow = seasonings.some(s => ['oil', 'butter', 'lemon'].includes(s.id));

  let bgColor = 'bg-amber-100/60'; // Default light stock
  if (hasDark) bgColor = 'bg-stone-800/80';
  else if (hasRed) bgColor = 'bg-red-600/70';
  else if (hasYellow) bgColor = 'bg-yellow-400/60';

  return {
    height: isCooking ? '70%' : '40%', // Rise when mixing
    className: bgColor
  };
};
