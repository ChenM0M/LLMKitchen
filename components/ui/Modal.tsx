import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassPanel, cn } from './GlassPanel';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className,
    size = 'md'
}) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        full: 'max-w-full m-4',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[51] flex items-center justify-center pointer-events-none p-4">
                        <GlassPanel
                            className={cn(
                                'w-full pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden',
                                sizes[size],
                                className
                            )}
                            variant="light"
                            intensity="high"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Header */}
                            {(title || onClose) && (
                                <div className="flex items-center justify-between p-4 border-b border-stone-200/50">
                                    <div className="text-lg font-display font-bold text-stone-800">
                                        {title}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                                {children}
                            </div>
                        </GlassPanel>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
