import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './GlassPanel'; // Reuse cn utility
import { audioService } from '../../services/audioService';

interface GameButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    soundType?: 'click' | 'pop' | 'success';
}

export const GameButton: React.FC<GameButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    soundType = 'click',
    onClick,
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-gradient-to-b from-primary-400 to-primary-600 text-white border-b-4 border-primary-800 active:border-b-0 active:translate-y-1 shadow-md active:shadow-sm hover:brightness-110',
        secondary: 'bg-gradient-to-b from-secondary-400 to-secondary-600 text-white border-b-4 border-secondary-800 active:border-b-0 active:translate-y-1 shadow-md active:shadow-sm hover:brightness-110',
        accent: 'bg-gradient-to-b from-accent-400 to-accent-600 text-white border-b-4 border-accent-800 active:border-b-0 active:translate-y-1 shadow-md active:shadow-sm hover:brightness-110',
        danger: 'bg-gradient-to-b from-red-400 to-red-600 text-white border-b-4 border-red-800 active:border-b-0 active:translate-y-1 shadow-md active:shadow-sm hover:brightness-110',
        ghost: 'bg-transparent text-stone-600 hover:bg-stone-100 border-b-4 border-transparent active:border-b-0 active:translate-y-1 hover:shadow-sm',
    };

    const sizes = {
        sm: 'px-3 py-1 text-xs rounded-lg',
        md: 'px-4 py-2 text-sm rounded-xl',
        lg: 'px-6 py-3 text-lg rounded-2xl',
        icon: 'p-2 rounded-xl aspect-square flex items-center justify-center',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;

        // Play sound
        if (soundType === 'click') audioService.playClick();
        // Add other sounds as needed

        onClick?.(e);
    };

    return (
        <motion.button
            className={cn(
                'font-display font-bold uppercase tracking-wide transition-all relative overflow-hidden',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4',
                variants[variant],
                sizes[size],
                className
            )}
            onClick={handleClick}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}

            {/* Shine effect */}
            {!disabled && variant !== 'ghost' && (
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none" />
            )}
        </motion.button>
    );
};
