import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { StationType, Language } from '../types';
import { useDragState } from './DragDropContext';

interface DroppableStationProps {
    stationType: StationType;
    children: React.ReactNode;
    language: Language;
    disabled?: boolean;
    className?: string;
}

const stationLabels: Record<StationType, { en: string; zh: string; icon: string }> = {
    prep: { en: 'Prep Station', zh: '备菜台', icon: '🔪' },
    marinate: { en: 'Marinate Station', zh: '腌制台', icon: '🧂' },
    cook: { en: 'Cook Station', zh: '烹饪台', icon: '🔥' },
    bar: { en: 'Bar Station', zh: '调酒台', icon: '🍸' },
    submit: { en: 'Serve', zh: '出盘台', icon: '🍽️' },
};

export const DroppableStation: React.FC<DroppableStationProps> = ({
    stationType,
    children,
    language,
    disabled = false,
    className = '',
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: stationType,
        disabled,
    });

    const { isDragging } = useDragState();
    const label = stationLabels[stationType];

    return (
        <div
            ref={setNodeRef}
            className={`
        relative transition-all duration-200
        ${isDragging ? 'ring-2 ring-dashed ring-amber-400/50' : ''}
        ${isOver ? 'ring-4 ring-amber-400 bg-amber-50/20 scale-[1.02]' : ''}
        ${className}
      `}
        >
            {/* Drop indicator when dragging */}
            {isDragging && !disabled && (
                <div className={`
          absolute inset-0 z-10 pointer-events-none
          flex items-center justify-center
          ${isOver ? 'opacity-100' : 'opacity-50'}
        `}>
                    <div className={`
            bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg
            border-2 ${isOver ? 'border-amber-400' : 'border-amber-200'}
            flex items-center gap-2
            transition-all duration-200
            ${isOver ? 'scale-110' : 'scale-100'}
          `}>
                        <span className="text-2xl">{label.icon}</span>
                        <span className="font-bold text-stone-700">
                            {language === 'zh' ? `放入${label.zh}` : `Drop to ${label.en}`}
                        </span>
                    </div>
                </div>
            )}

            {children}
        </div>
    );
};

export default DroppableStation;
