import React from 'react';
import { KitchenItem, MixMethod, Language, AnyCookingMethod, Theme } from '../../types';
import { DraggableIngredient } from '../DraggableIngredient';
import { Wine, RotateCw, Layers } from 'lucide-react';
import { t } from '../../translations';

interface BarStationProps {
    items: KitchenItem[];
    onProcess: (method: MixMethod) => void;
    onRemoveItem?: (item: KitchenItem) => void;
    selectedMix: MixMethod | null;
    onSelectMix: (method: MixMethod) => void;
    isCooking: boolean;
    isSubmitting?: boolean;
    activeAnimationMethod?: AnyCookingMethod | null;
    language: Language;
    theme?: Theme;
}

export const BarStation: React.FC<BarStationProps> = ({
    items,
    onProcess,
    onRemoveItem,
    selectedMix,
    onSelectMix,
    isCooking,
    isSubmitting,
    activeAnimationMethod,
    language,
    theme = 'modern'
}) => {
    const isZh = language === 'zh';
    const isLoading = isCooking || isSubmitting;

    const methods = [
        { id: MixMethod.SHAKE, icon: <RotateCw size={20} />, label: isZh ? '摇晃' : 'Shake', color: 'from-cyan-500 to-cyan-600' },
        { id: MixMethod.STIR, icon: <Wine size={20} />, label: isZh ? '搅拌' : 'Stir', color: 'from-purple-500 to-purple-600' },
        { id: MixMethod.BUILD, icon: <Layers size={20} />, label: isZh ? '分层' : 'Build', color: 'from-lime-500 to-lime-600' },
    ];

    return (
        <div className="h-full flex flex-col p-3 sm:p-4">
            {/* 食材展示区 */}
            <div className="flex-1 flex items-center justify-center overflow-auto min-h-0">
                {items.length === 0 ? (
                    <div className="text-stone-400 text-lg opacity-50 text-center">
                        {t('emptyStation', language)}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3 justify-center p-2">
                        {items.map((item) => (
                            <DraggableIngredient
                                key={item.instanceId}
                                item={item}
                                language={language}
                                onRemove={onRemoveItem && !isLoading ? () => onRemoveItem(item) : undefined}
                                disabled={isLoading}
                                sourceStation="BAR"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 控制区 */}
            <div className="flex-shrink-0 space-y-3 pt-3 border-t border-stone-200/50">
                {/* 调酒方法选择 */}
                <div className="flex gap-2 justify-center">
                    {methods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => {
                                onSelectMix(method.id as MixMethod);
                                if (items.length > 0) {
                                    onProcess(method.id as MixMethod);
                                }
                            }}
                            disabled={isLoading || items.length === 0}
                            className={`
                                flex-1 max-w-[120px] flex flex-col items-center gap-1 py-3 px-4 rounded-xl
                                bg-gradient-to-br ${method.color} text-white font-medium
                                transition-all duration-200
                                ${isLoading || items.length === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-105 hover:shadow-lg active:scale-95'
                                }
                                ${selectedMix === method.id ? 'ring-2 ring-white ring-offset-2' : ''}
                            `}
                        >
                            {method.icon}
                            <span className="text-sm">{method.label}</span>
                        </button>
                    ))}
                </div>

                {/* 提示文字 */}
                <p className="text-xs text-stone-400 text-center">
                    {isZh ? '💡 调制后食材会返回台面，拖到「出盘台」才会结算' : '💡 Mixed items return to counter. Drag to "Serve" to submit.'}
                </p>
            </div>
        </div>
    );
};

export default BarStation;
