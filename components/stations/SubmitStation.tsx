import React from 'react';
import { KitchenItem, Language, Theme } from '../../types';
import { GameButton } from '../ui/GameButton';
import { GlassPanel } from '../ui/GlassPanel';
import { Send, X, Sparkles } from 'lucide-react';
import { t } from '../../translations';
import { DraggableIngredient } from '../DraggableIngredient';

interface SubmitStationProps {
    items: KitchenItem[];
    onSubmit: () => void;
    onRemoveItem?: (item: KitchenItem) => void;
    onClear?: () => void;
    isSubmitting: boolean;
    language: Language;
    theme?: Theme;
}

export const SubmitStation: React.FC<SubmitStationProps> = ({
    items,
    onSubmit,
    onRemoveItem,
    onClear,
    isSubmitting,
    language,
    theme = 'default'
}) => {
    const isJapanese = theme === 'japanese';
    const isZh = language === 'zh';

    // Calculate total process steps
    const totalSteps = items.reduce((sum, item) => sum + (item.processHistory?.length || 0), 0);
    const hasMergedItems = items.some(item => item.isMerged);

    return (
        <div className="h-full flex flex-col items-center justify-start gap-2 sm:gap-4 p-2 sm:p-4 overflow-y-auto">
            {/* Title - 移动端隐藏 */}
            <div className="hidden sm:flex items-center gap-2 text-xl font-bold text-amber-700">
                <Sparkles className="w-5 h-5" />
                <span>{isZh ? '出盘台' : 'Serve Station'}</span>
            </div>

            {/* Plate Visual - 移动端缩小 */}
            <div className={`
        relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72
        rounded-full
        bg-gradient-to-br from-white via-stone-50 to-stone-100
        shadow-[0_10px_30px_rgba(0,0,0,0.12),inset_0_-3px_10px_rgba(0,0,0,0.05)]
        border-4 sm:border-8 border-stone-200
        flex items-center justify-center flex-shrink-0
        ${isSubmitting ? 'animate-pulse' : ''}
      `}>
                {/* Plate rim */}
                <div className="absolute inset-2 sm:inset-4 rounded-full border border-stone-100" />

                {/* Items on plate */}
                {items.length === 0 ? (
                    <div className="text-stone-400 text-center px-4">
                        <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🍽️</div>
                        <p className="text-xs sm:text-sm">
                            {isZh ? '拖放食材到这里' : 'Drag items here'}
                        </p>
                    </div>
                ) : (
                    <div className={`
                        absolute inset-4 sm:inset-6 
                        grid place-items-center
                        ${items.length === 1 ? 'grid-cols-1' :
                            items.length === 2 ? 'grid-cols-2' :
                                items.length <= 4 ? 'grid-cols-2' :
                                    items.length <= 6 ? 'grid-cols-3' :
                                        'grid-cols-4'}
                        gap-0.5 sm:gap-1
                        overflow-hidden
                    `}>
                        {items.slice(0, 12).map((item) => (
                            <div key={item.instanceId} className="transform scale-75 sm:scale-90">
                                <DraggableIngredient
                                    item={item}
                                    language={language}
                                    onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
                                    disabled={isSubmitting}
                                    sourceStation="SUBMIT"
                                    compact
                                />
                            </div>
                        ))}
                        {items.length > 12 && (
                            <div className="text-xs text-stone-500 font-bold">
                                +{items.length - 12}
                            </div>
                        )}
                    </div>
                )}

                {/* Process info badge */}
                {totalSteps > 0 && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow">
                        {totalSteps}{isZh ? '步' : ''}
                    </div>
                )}
            </div>

            {/* Info - 更紧凑 */}
            {items.length > 0 && (
                <div className="text-center text-xs sm:text-sm text-stone-500">
                    <p>
                        {isZh
                            ? `${items.length}种食材`
                            : `${items.length} items`
                        }
                    </p>
                </div>
            )}

            {/* Controls - 移动端横排紧凑 */}
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                {items.length > 0 && onClear && (
                    <GameButton
                        onClick={onClear}
                        disabled={isSubmitting}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 px-3"
                    >
                        <X size={14} />
                        <span className="text-xs sm:text-sm">{isZh ? '清空' : 'Clear'}</span>
                    </GameButton>
                )}

                <GameButton
                    onClick={onSubmit}
                    disabled={isSubmitting || items.length === 0}
                    variant="primary"
                    size="md"
                    className="flex items-center gap-1.5 px-4 sm:px-6"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm sm:text-base">{isZh ? '评分中' : 'Judging'}</span>
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            <span className="text-sm sm:text-base font-bold">{isZh ? '评分！' : 'Serve!'}</span>
                        </>
                    )}
                </GameButton>
            </div>
        </div>
    );
};

export default SubmitStation;
