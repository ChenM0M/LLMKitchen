import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import { KitchenItem, StationType } from '../types';

interface DragContextValue {
    activeItem: KitchenItem | null;
    isDragging: boolean;
}

const DragStateContext = createContext<DragContextValue>({
    activeItem: null,
    isDragging: false,
});

export const useDragState = () => useContext(DragStateContext);

interface DragDropProviderProps {
    children: React.ReactNode;
    onItemDrop: (item: KitchenItem, targetStation: StationType, sourceStation?: string) => void;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
    children,
    onItemDrop,
}) => {
    const [activeItem, setActiveItem] = useState<KitchenItem | null>(null);

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // 8px of movement required before drag starts
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 200,
            tolerance: 5,
        },
    });

    const sensors = useSensors(pointerSensor, touchSensor);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const item = active.data.current?.item as KitchenItem;
        if (item) {
            setActiveItem(item);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.data.current?.item) {
            const item = active.data.current.item as KitchenItem;
            const targetStation = over.id as StationType;
            const sourceStation = active.data.current.sourceStation as string | undefined;
            onItemDrop(item, targetStation, sourceStation);
        }

        setActiveItem(null);
    }, [onItemDrop]);

    const handleDragCancel = useCallback(() => {
        setActiveItem(null);
    }, []);

    return (
        <DragStateContext.Provider value={{ activeItem, isDragging: !!activeItem }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {children}
                <DragOverlay dropAnimation={null}>
                    {activeItem ? (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur rounded-xl shadow-2xl border-2 border-amber-400 flex flex-col items-center justify-center gap-1 transform scale-110 cursor-grabbing">
                            <span className="text-2xl sm:text-3xl filter drop-shadow-lg animate-bounce">
                                {activeItem.emoji}
                            </span>
                            <span className="text-[8px] sm:text-[10px] font-bold text-stone-600 truncate max-w-full px-1">
                                {activeItem.name}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </DragStateContext.Provider>
    );
};
