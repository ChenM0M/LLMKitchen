import React from 'react';
import { KitchenItem, HeatMethod, Language, AnyCookingMethod, Theme, canProcess, getProcessLimitMessage } from '../../types';
import { GameButton } from '../ui/GameButton';
import { Flame, Waves, Thermometer, CloudRain, Timer, AlertCircle } from 'lucide-react';
import { t } from '../../translations';
import { DraggableIngredient } from '../DraggableIngredient';

interface CookStationProps {
    items: KitchenItem[];
    onAction: (method: HeatMethod) => void; // 处理方法
    onRemoveItem?: (item: KitchenItem) => void;
    selectedHeat: HeatMethod | 'raw' | null;
    onSelectHeat: (method: HeatMethod | 'raw') => void;
    isCooking: boolean;
    isSubmitting?: boolean;
    activeAnimationMethod?: AnyCookingMethod | null;
    language: Language;
    theme?: Theme;
}

export const CookStation: React.FC<CookStationProps> = ({
    items,
    onAction,
    onRemoveItem,
    selectedHeat,
    onSelectHeat,
    isCooking,
    isSubmitting,
    activeAnimationMethod,
    language,
    theme = 'default'
}) => {
    const isZh = language === 'zh';
    const hasMaxProcessed = items.some(item => !canProcess(item));
    const isLoading = isCooking || isSubmitting;

    // 烹饪方法分组
    const wetMethods = [
        { id: HeatMethod.BOIL, icon: <Waves size={16} />, label: isZh ? '煮' : 'Boil', color: 'bg-blue-500' },
        { id: HeatMethod.STEAM, icon: <CloudRain size={16} />, label: isZh ? '蒸' : 'Steam', color: 'bg-blue-300' },
        { id: HeatMethod.BRAISE, icon: <Waves size={16} />, label: isZh ? '炖' : 'Braise', color: 'bg-amber-700' },
    ];

    const dryMethods = [
        { id: HeatMethod.FRY, icon: <Flame size={16} />, label: isZh ? '煎' : 'Fry', color: 'bg-orange-500' },
        { id: HeatMethod.DEEP_FRY, icon: <Flame size={16} />, label: isZh ? '炸' : 'Deep Fry', color: 'bg-orange-600' },
        { id: HeatMethod.STIR_FRY, icon: <Flame size={16} />, label: isZh ? '炒' : 'Stir Fry', color: 'bg-red-500' },
    ];

    const ovenMethods = [
        { id: HeatMethod.BAKE, icon: <Thermometer size={16} />, label: isZh ? '烘烤' : 'Bake', color: 'bg-red-600' },
        { id: HeatMethod.GRILL, icon: <Flame size={16} />, label: isZh ? '烧烤' : 'Grill', color: 'bg-red-700' },
        { id: HeatMethod.MICROWAVE, icon: <Timer size={16} />, label: isZh ? '微波' : 'Microwave', color: 'bg-yellow-500' },
    ];

    const getAnimationClass = () => {
        switch (activeAnimationMethod) {
            case HeatMethod.FRY:
            case HeatMethod.DEEP_FRY:
            case HeatMethod.STIR_FRY:
                return 'animate-sizzle';
            case HeatMethod.BOIL:
            case HeatMethod.STEAM:
            case HeatMethod.BRAISE:
                return 'animate-boil';
            case HeatMethod.BAKE:
            case HeatMethod.GRILL:
            case HeatMethod.MICROWAVE:
                return 'animate-pulse-glow';
            default:
                return '';
        }
    };

    const renderMethodButton = (method: { id: HeatMethod; icon: React.ReactNode; label: string; color: string }) => (
        <button
            key={method.id}
            onClick={() => onAction(method.id)}
            disabled={isLoading || items.length === 0 || hasMaxProcessed}
            className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium
                transition-all duration-200
                ${method.color}
                ${isLoading || items.length === 0 || hasMaxProcessed
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-md active:scale-95'
                }
            `}
        >
            {method.icon}
            <span>{method.label}</span>
        </button>
    );

    return (
        <div className="h-full flex flex-col p-3 sm:p-4">
            {/* 警告提示 */}
            {hasMaxProcessed && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm mb-3">
                    <AlertCircle size={16} />
                    <span>{getProcessLimitMessage(language)}</span>
                </div>
            )}

            {/* 食材展示区 - 占据主要空间 */}
            <div className="flex-1 flex items-center justify-center overflow-auto min-h-0">
                {items.length === 0 ? (
                    <div className="text-stone-400 text-lg opacity-50 text-center">
                        {t('emptyStation', language)}
                    </div>
                ) : (
                    <div className={`flex flex-wrap gap-3 justify-center p-2 ${getAnimationClass()}`}>
                        {items.map((item) => (
                            <div key={item.instanceId} className="relative">
                                <DraggableIngredient
                                    item={item}
                                    language={language}
                                    onRemove={onRemoveItem && !isLoading ? () => onRemoveItem(item) : undefined}
                                    disabled={isLoading}
                                    sourceStation="COOK"
                                />
                                {isCooking && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg animate-steam opacity-60">
                                        ♨️
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 控制区 - 底部固定 */}
            <div className="flex-shrink-0 space-y-2 pt-3 border-t border-stone-200/50">
                {/* 手机端横向滚动，电脑端网格 */}
                <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible scrollbar-hide">
                    {wetMethods.map(renderMethodButton)}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible scrollbar-hide">
                    {dryMethods.map(renderMethodButton)}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible scrollbar-hide">
                    {ovenMethods.map(renderMethodButton)}
                </div>

                {/* 提示文字 */}
                <p className="text-xs text-stone-400 text-center pt-2">
                    {isZh ? '💡 处理后食材会返回台面，拖到「出盘台」才会结算' : '💡 Processed items return to counter. Drag to "Serve" to submit.'}
                </p>
            </div>
        </div>
    );
};

export default CookStation;
