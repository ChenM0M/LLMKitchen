import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';

interface BottomDockProps {
    children: React.ReactNode;
    className?: string;
}

export const BottomDock: React.FC<BottomDockProps> = ({
    children,
    className
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[30] p-2 sm:p-4 pointer-events-none flex justify-center">
            <GlassPanel
                className={`pointer-events-auto w-full max-w-3xl mx-auto rounded-3xl p-2 sm:p-3 shadow-float transition-all duration-300 ${className}`}
                intensity="high"
                variant="light"
            >
                {children}
            </GlassPanel>
        </div>
    );
};
