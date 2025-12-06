import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PrepMethod, HeatMethod, MixMethod, MarinateMethod, AnyCookingMethod } from '../../types';

interface StationParticlesProps {
    activeMethod: AnyCookingMethod | null;
    colorClass?: string;
}

export const StationParticles: React.FC<StationParticlesProps> = ({ activeMethod, colorClass }) => {
    if (!activeMethod) return null;

    // Helper to get color style, defaulting to improved high-contrast default
    const getColor = (defaultColor: string = 'bg-stone-300') => {
        // If colorClass is provided, use it but maybe lighten/darken or use as is
        // Since colorClass is like 'bg-red-500', we can directly use it
        return colorClass || defaultColor;
    };

    const getParticles = () => {
        switch (activeMethod) {
            case PrepMethod.CHOP:
                // Sharp, chaotic cuts - High Visibility (Darker)
                return (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`chop-${i}`}
                                className={`absolute w-1 h-8 rounded-full shadow-md z-30 bg-stone-700`}
                                initial={{ opacity: 0, scale: 0, x: Math.random() * 150 - 75, y: Math.random() * 100 - 50, rotate: 45 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1.2, 0.8],
                                    rotate: [45, 45 + (Math.random() - 0.5) * 60],
                                    x: Math.random() * 200 - 100
                                }}
                                transition={{ duration: 0.25, repeat: Infinity, repeatDelay: Math.random() * 0.15 }}
                            />
                        ))}
                        {/* Impact ring */}
                        <motion.div
                            className="absolute w-20 h-20 rounded-full border-4 border-stone-600/40 z-20"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: [0.6, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                        />
                    </>
                );
            case PrepMethod.SLICE:
                // Smooth, long clean cuts - Darker lines
                return (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={`slice-${i}`}
                                className="absolute w-0.5 h-24 bg-stone-800/80 shadow-md z-30"
                                style={{ transformOrigin: 'top center' }}
                                initial={{ opacity: 0, rotate: -20, y: -50 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    rotate: [-20, 20],
                                    y: 50
                                }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                            />
                        ))}
                    </>
                );
            case PrepMethod.JULIENNE:
                // Many thin parallel lines
                return (
                    <>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={`julienne-${i}`}
                                className={`absolute w-0.5 h-16 ${getColor('bg-yellow-200')} opacity-80`}
                                initial={{ opacity: 0, x: (i - 4) * 15, y: -30 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: 30,
                                    height: [64, 40]
                                }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05, repeatDelay: 0.1 }}
                            />
                        ))}
                    </>
                );
            case PrepMethod.MASH:
                // Crushing impact, expanding outward
                return (
                    <>
                        <motion.div
                            className={`absolute w-32 h-32 rounded-full ${getColor('bg-amber-200')} opacity-30 blur-xl`}
                            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={`mash-splash-${i}`}
                                className={`absolute w-3 h-3 rounded-full ${getColor('bg-amber-300')}`}
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: [0, 1.5, 0],
                                    x: Math.cos(i * 72 * Math.PI / 180) * 60,
                                    y: Math.sin(i * 72 * Math.PI / 180) * 60,
                                    opacity: [1, 0]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
                            />
                        ))}
                    </>
                );
            case PrepMethod.GRIND:
                // Dust particles
                return (
                    <>
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={`grind-${i}`}
                                className={`absolute w-1 h-1 rounded-full ${getColor('bg-stone-500')}`}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{
                                    y: 40,
                                    x: (Math.random() - 0.5) * 40,
                                    opacity: [0, 1, 0]
                                }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: Math.random() * 0.5 }}
                            />
                        ))}
                    </>
                );
            case PrepMethod.BLEND:
                // Spirals
                return (
                    <motion.div
                        className={`absolute w-40 h-40 border-4 border-dashed rounded-full ${getColor('border-purple-300/50')}`}
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5, repeat: Infinity } }}
                    >
                        <motion.div className={`absolute inset-0 bg-transparent blur-md ${getColor('bg-purple-200/20')}`} />
                    </motion.div>
                );
            case MarinateMethod.MARINATE:
                return (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={`drip-${i}`}
                                className="absolute bg-amber-500/80 w-2 h-3 rounded-full blur-[1px]"
                                initial={{ y: -60, opacity: 0, scale: 0.8 }}
                                animate={{ y: 60, opacity: [0, 0.8, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: "easeIn" }}
                            />
                        ))}
                        <motion.div
                            className={`absolute inset-0 bg-amber-500/10 rounded-xl z-20`}
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </>
                );
            case HeatMethod.BOIL:
            case HeatMethod.STEAM:
                return (
                    <>
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={`steam-${i}`}
                                className="absolute bg-white/30 w-6 h-6 rounded-full blur-sm"
                                initial={{ y: 50, opacity: 0, scale: 0.5 }}
                                animate={{ y: -150, opacity: [0, 0.6, 0], scale: 1.5 }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                            />
                        ))}
                    </>
                );
            case HeatMethod.FRY:
                return (
                    <>
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={`oil-${i}`}
                                className="absolute bg-orange-400 w-1.5 h-1.5 rounded-full"
                                initial={{ y: 0, x: 0, opacity: 0 }}
                                animate={{
                                    y: [0, -40 - Math.random() * 20],
                                    x: [0, (Math.random() - 0.5) * 40],
                                    opacity: [1, 0]
                                }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                            />
                        ))}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
            {getParticles()}
        </div>
    );
};
