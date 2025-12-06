import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassPanelProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: 'light' | 'dark' | 'accent';
    intensity?: 'low' | 'medium' | 'high';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
    children,
    className,
    variant = 'light',
    intensity = 'medium',
    ...props
}) => {
    const variants = {
        light: 'bg-white/60 border-white/40 text-stone-800',
        dark: 'bg-stone-900/60 border-white/10 text-white',
        accent: 'bg-primary-500/80 border-primary-400/50 text-white',
    };

    const intensities = {
        low: 'backdrop-blur-sm shadow-sm border-white/20',
        medium: 'backdrop-blur-md shadow-glass-sm border-white/40 shadow-inner',
        high: 'backdrop-blur-xl shadow-glass border-white/50 ring-1 ring-white/30',
    };

    return (
        <motion.div
            className={cn(
                'rounded-3xl border transition-all duration-300',
                variants[variant],
                intensities[intensity],
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
