import React from 'react';
import { Utensils, Droplets, Martini, Flame, UtensilsCrossed } from 'lucide-react';
import { Language, Theme } from '../types';
import { t } from '../translations';
import { motion } from 'framer-motion';

interface StationSelectorProps {
    mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT';
    onSetMode: (mode: 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT') => void;
    isCooking: boolean;
    language: Language;
    theme: Theme;
}

const STATIONS = [
    {
        id: 'PREP' as const,
        icon: Utensils,
        emoji: '🔪',
        color: 'from-stone-500 to-stone-600',
        activeColor: 'from-stone-600 to-stone-700',
        lightColor: 'bg-stone-100'
    },
    {
        id: 'MARINATE' as const,
        icon: Droplets,
        emoji: '🫙',
        color: 'from-amber-500 to-amber-600',
        activeColor: 'from-amber-600 to-amber-700',
        lightColor: 'bg-amber-100'
    },
    {
        id: 'BAR' as const,
        icon: Martini,
        emoji: '🍸',
        color: 'from-purple-500 to-purple-600',
        activeColor: 'from-purple-600 to-purple-700',
        lightColor: 'bg-purple-100'
    },
    {
        id: 'COOK' as const,
        icon: Flame,
        emoji: '🔥',
        color: 'from-orange-500 to-red-500',
        activeColor: 'from-orange-600 to-red-600',
        lightColor: 'bg-orange-100'
    },
    {
        id: 'SUBMIT' as const,
        icon: UtensilsCrossed,
        emoji: '🍽️',
        color: 'from-emerald-500 to-emerald-600',
        activeColor: 'from-emerald-600 to-emerald-700',
        lightColor: 'bg-emerald-100'
    },
];

const getLabel = (id: string, language: Language) => {
    switch (id) {
        case 'PREP': return t('prepStation', language);
        case 'MARINATE': return t('marinateStation', language);
        case 'BAR': return t('barStation', language);
        case 'COOK': return t('cookingStation', language);
        case 'SUBMIT': return t('serveStation', language);
        default: return id;
    }
};

export const StationSelector: React.FC<StationSelectorProps> = ({
    mode,
    onSetMode,
    isCooking,
    language,
    theme
}) => {
    const isJapanese = theme === 'japanese';

    return (
        <div className={`
            flex-none flex gap-1.5 sm:gap-2 p-2 sm:p-3 
            mx-2 sm:mx-4 md:mx-6 mt-1 sm:mt-2
            rounded-2xl sm:rounded-3xl
            overflow-x-auto scrollbar-hide
            z-20 relative
            ${isJapanese
                ? 'bg-stone-100/80 backdrop-blur-md shadow-inner'
                : 'bg-white/60 backdrop-blur-md shadow-lg shadow-stone-200/30'
            }
        `}>
            {STATIONS.map((station) => {
                const isActive = mode === station.id;
                const Icon = station.icon;

                return (
                    <motion.button
                        key={station.id}
                        onClick={() => onSetMode(station.id)}
                        disabled={isCooking}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            relative flex-1 min-w-[64px] sm:min-w-[80px]
                            py-2 sm:py-2.5 px-2 sm:px-4
                            rounded-xl sm:rounded-2xl
                            font-bold
                            flex flex-col items-center justify-center gap-0.5 sm:gap-1
                            transition-all duration-200
                            ${isActive
                                ? `bg-gradient-to-br ${station.activeColor} text-white shadow-lg`
                                : `${station.lightColor} text-stone-600 hover:shadow-md`
                            }
                            ${isCooking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {/* Emoji 图标 */}
                        <span className="text-lg sm:text-xl">
                            {station.emoji}
                        </span>

                        {/* 标签 */}
                        <span className={`
                            text-[9px] sm:text-[10px] md:text-xs 
                            font-bold tracking-wide
                            whitespace-nowrap
                            ${isActive ? 'text-white/90' : 'text-stone-500'}
                        `}>
                            {getLabel(station.id, language)}
                        </span>

                        {/* 活动指示点 */}
                        {isActive && (
                            <motion.div
                                layoutId="activeIndicator"
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-md"
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};
