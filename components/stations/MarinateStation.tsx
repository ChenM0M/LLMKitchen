import React from 'react';
import { KitchenItem, Language, AnyCookingMethod, PrepMethod, Theme } from '../../types';
import { GameButton } from '../ui/GameButton';
import { DraggableIngredient } from '../DraggableIngredient';
import { Droplets, X } from 'lucide-react';
import { t } from '../../translations';

interface MarinateStationProps {
    items: KitchenItem[];
    onAction: () => void;
    onRemoveItem?: (item: KitchenItem) => void;
    isCooking: boolean;
    activeAnimationMethod?: AnyCookingMethod | null;
    language: Language;
    theme?: Theme;
}

export const MarinateStation: React.FC<MarinateStationProps> = ({
    items,
    onAction,
    onRemoveItem,
    isCooking,
    activeAnimationMethod,
    language,
    theme = 'modern'
}) => {

    return (
        <div className="h-full flex flex-col items-center justify-center gap-4 sm:gap-8">

            {/* Visual Area */}
            <div className="flex-1 w-full flex items-center justify-center relative overflow-auto">
                {items.length === 0 ? (
                    <div className="text-stone-400 font-display text-lg sm:text-xl opacity-50 text-center px-4">
                        {t('emptyStation', language)}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 sm:gap-4 justify-center p-2">
                        {items.map((item) => (
                            <DraggableIngredient
                                key={item.instanceId}
                                item={item}
                                language={language}
                                onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
                                disabled={isCooking}
                                sourceStation="MARINATE"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <GameButton
                    onClick={onAction}
                    disabled={isCooking || items.length === 0}
                    variant="primary"
                    size="lg"
                    className="flex flex-col items-center gap-1 min-w-[120px]"
                >
                    <Droplets size={24} />
                    <span className="text-xs">{t('marinate', language)}</span>
                </GameButton>
            </div>
        </div>
    );
};
