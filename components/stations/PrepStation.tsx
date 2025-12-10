import React, { useState } from 'react';
import { KitchenItem, PrepMethod, Language, AnyCookingMethod, Theme, canProcess, getProcessLimitMessage, MAX_PROCESS_STEPS } from '../../types';
import { GameButton } from '../ui/GameButton';
import { Wind, Scissors, Zap, Slice, Sparkles, AlertCircle } from 'lucide-react';
import { t } from '../../translations';
import { DraggableIngredient } from '../DraggableIngredient';

interface PrepStationProps {
    items: KitchenItem[];
    onAction: (method: PrepMethod, mode?: 'MERGE' | 'SEPARATE') => void;
    onRemoveItem?: (item: KitchenItem) => void;
    isCooking: boolean;
    activeAnimationMethod?: AnyCookingMethod | null;
    language: Language;
    theme?: Theme;
}

export const PrepStation: React.FC<PrepStationProps> = ({
    items,
    onAction,
    onRemoveItem,
    isCooking,
    activeAnimationMethod,
    language,
    theme = 'default'
}) => {
    const [showMergeOption, setShowMergeOption] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PrepMethod | null>(null);
    const isZh = language === 'zh';

    // Check if any item has reached max process steps
    const hasMaxProcessed = items.some(item => !canProcess(item));
    const canDoMerge = items.length >= 2;

    // Prep actions - separated into groups
    const cutActions = [
        { id: PrepMethod.CHOP, icon: <Scissors size={18} />, label: isZh ? '切碎' : 'Chop', color: 'bg-stone-500' },
        { id: PrepMethod.SLICE, icon: <Slice size={18} />, label: isZh ? '切片' : 'Slice', color: 'bg-stone-400' },
        { id: PrepMethod.JULIENNE, icon: <Scissors size={18} />, label: isZh ? '切丝' : 'Julienne', color: 'bg-stone-300' },
    ];

    const processActions = [
        { id: PrepMethod.MASH, icon: <Sparkles size={18} />, label: isZh ? '捣碎' : 'Mash', color: 'bg-amber-500', canMerge: true },
        { id: PrepMethod.GRIND, icon: <Zap size={18} />, label: isZh ? '磨粉' : 'Grind', color: 'bg-stone-600' },
        { id: PrepMethod.BLEND, icon: <Zap size={18} />, label: isZh ? '搅拌' : 'Blend', color: 'bg-purple-500', canMerge: true },
    ];

    const dryActions = [
        { id: PrepMethod.AIR_DRY, icon: <Wind size={18} />, label: isZh ? '风干' : 'Air Dry', color: 'bg-blue-400' },
        { id: PrepMethod.DEHYDRATE, icon: <Wind size={18} />, label: isZh ? '脱水' : 'Dehydrate', color: 'bg-orange-300' },
    ];

    const handleActionClick = (method: PrepMethod) => {
        // Any method can merge if multiple items are present, per user request
        if (canDoMerge) {
            setSelectedMethod(method);
            setShowMergeOption(true);
        } else {
            onAction(method, 'SEPARATE');
        }
    };

    const handleMergeChoice = (mode: 'MERGE' | 'SEPARATE') => {
        if (selectedMethod) {
            onAction(selectedMethod, mode);
        }
        setShowMergeOption(false);
        setSelectedMethod(null);
    };

    const getAnimationClass = (method: PrepMethod) => {
        if (activeAnimationMethod === method) {
            switch (method) {
                case PrepMethod.CHOP:
                case PrepMethod.SLICE:
                case PrepMethod.JULIENNE:
                    return 'animate-chop';
                case PrepMethod.BLEND:
                case PrepMethod.MASH:
                    return 'animate-whirl';
                case PrepMethod.AIR_DRY:
                    return 'animate-breathe'; // Gentle breathing
                case PrepMethod.DEHYDRATE:
                    return 'animate-pulse-glow'; // Intense heat pulse
                default:
                    return '';
            }
        }
        return '';
    };

    return (
        <div className="h-full flex flex-col items-center justify-start gap-2 sm:gap-4 p-2 sm:p-4 overflow-hidden">
            {/* Warning for max processed items */}
            {hasMaxProcessed && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm flex-shrink-0">
                    <AlertCircle size={16} />
                    <span>{getProcessLimitMessage(language)}</span>
                </div>
            )}

            {/* Visual Area - 可滚动 */}
            <div className="flex-1 w-full min-h-0 flex items-start justify-center relative overflow-y-auto pb-4">
                {items.length === 0 ? (
                    <div className="text-stone-400 font-display text-lg opacity-50 text-center px-4">
                        {t('emptyStation', language)}
                    </div>
                ) : (
                    <div className={`flex flex-wrap gap-3 justify-center p-4 min-h-min ${getAnimationClass(activeAnimationMethod as PrepMethod)}`}>
                        {items.map((item) => (
                            <DraggableIngredient
                                key={item.instanceId}
                                item={item}
                                language={language}
                                onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
                                disabled={isCooking}
                                sourceStation="PREP"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Merge Option Dialog */}
            {showMergeOption && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-center mb-4">
                            {isZh ? '选择处理方式' : 'Choose Processing Mode'}
                        </h3>
                        <div className="flex gap-3">
                            <GameButton
                                onClick={() => handleMergeChoice('SEPARATE')}
                                variant="secondary"
                                size="lg"
                                className="flex-1 flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl">🔀</span>
                                <span className="text-sm">{isZh ? '分开处理' : 'Separate'}</span>
                            </GameButton>
                            <GameButton
                                onClick={() => handleMergeChoice('MERGE')}
                                variant="primary"
                                size="lg"
                                className="flex-1 flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl">🫙</span>
                                <span className="text-sm">{isZh ? '合并混合' : 'Merge'}</span>
                            </GameButton>
                        </div>
                        <button
                            onClick={() => setShowMergeOption(false)}
                            className="w-full mt-3 text-stone-500 text-sm hover:text-stone-700"
                        >
                            {isZh ? '取消' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Controls - Grouped */}
            <div className="w-full max-w-lg space-y-3">
                {/* Cut actions */}
                <div className="flex gap-2 justify-center">
                    {cutActions.map((action) => (
                        <GameButton
                            key={action.id}
                            onClick={() => handleActionClick(action.id)}
                            disabled={isCooking || items.length === 0 || hasMaxProcessed}
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1.5 ${action.color} text-white hover:opacity-90`}
                        >
                            {action.icon}
                            <span className="text-xs">{action.label}</span>
                        </GameButton>
                    ))}
                </div>

                {/* Process actions */}
                <div className="flex gap-2 justify-center">
                    {processActions.map((action) => (
                        <GameButton
                            key={action.id}
                            onClick={() => handleActionClick(action.id)}
                            disabled={isCooking || items.length === 0 || hasMaxProcessed}
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1.5 ${action.color} text-white hover:opacity-90`}
                        >
                            {action.icon}
                            <span className="text-xs">{action.label}</span>
                        </GameButton>
                    ))}
                </div>

                {/* Dry actions */}
                <div className="flex gap-2 justify-center">
                    {dryActions.map((action) => (
                        <GameButton
                            key={action.id}
                            onClick={() => handleActionClick(action.id)}
                            disabled={isCooking || items.length === 0 || hasMaxProcessed}
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1.5 ${action.color} text-white hover:opacity-90`}
                        >
                            {action.icon}
                            <span className="text-xs">{action.label}</span>
                        </GameButton>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrepStation;
