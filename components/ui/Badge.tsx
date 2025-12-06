import React from 'react';
import { cn } from './GlassPanel';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className
}) => {
    const variants = {
        default: 'bg-stone-200 text-stone-700',
        success: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
        warning: 'bg-amber-100 text-amber-700 border border-amber-200',
        danger: 'bg-red-100 text-red-700 border border-red-200',
        info: 'bg-blue-100 text-blue-700 border border-blue-200',
        outline: 'bg-transparent border border-stone-300 text-stone-600',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
};
