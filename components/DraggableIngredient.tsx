import React, { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { KitchenItem, Language, ItemStatus } from '../types';
import MergedEmojiDisplay from './MergedEmojiDisplay';
import { motion } from 'framer-motion';

interface DraggableIngredientProps {
    item: KitchenItem;
    language: Language;
    disabled?: boolean;
    onRemove?: () => void;
    showStatus?: boolean;
    sourceStation?: string;
    className?: string;
    onClick?: () => void;
    compact?: boolean; // 紧凑模式，用于出盘台多食材显示
}

// 处理状态对应的图标和颜色 - 更清晰的视觉标识
const STATUS_ICONS: Record<string, { icon: string; color: string; label: { zh: string; en: string } }> = {
    chopped: { icon: '🔪', color: 'from-stone-500 to-stone-600', label: { zh: '切', en: 'Cut' } },
    sliced: { icon: '🔪', color: 'from-stone-400 to-stone-500', label: { zh: '片', en: 'Sli' } },
    julienned: { icon: '🔪', color: 'from-stone-300 to-stone-400', label: { zh: '丝', en: 'Jul' } },
    mashed: { icon: '🥣', color: 'from-amber-400 to-amber-500', label: { zh: '捣', en: 'Msh' } },
    ground: { icon: '⚙️', color: 'from-stone-600 to-stone-700', label: { zh: '磨', en: 'Gnd' } },
    blended: { icon: '🌀', color: 'from-purple-400 to-purple-500', label: { zh: '搅', en: 'Bld' } },
    dried: { icon: '💨', color: 'from-blue-300 to-blue-400', label: { zh: '干', en: 'Dry' } },
    dehydrated: { icon: '☀️', color: 'from-orange-300 to-orange-400', label: { zh: '脱', en: 'Dhy' } },
    marinated: { icon: '🫙', color: 'from-amber-500 to-amber-600', label: { zh: '腌', en: 'Mar' } },
    brined: { icon: '🧂', color: 'from-cyan-400 to-cyan-500', label: { zh: '盐', en: 'Brn' } },
    fried: { icon: '🍳', color: 'from-orange-400 to-orange-500', label: { zh: '煎', en: 'Fry' } },
    deep_fried: { icon: '🍟', color: 'from-orange-500 to-orange-600', label: { zh: '炸', en: 'DFr' } },
    stir_fried: { icon: '🥡', color: 'from-red-400 to-red-500', label: { zh: '炒', en: 'Stf' } },
    boiled: { icon: '♨️', color: 'from-blue-400 to-blue-500', label: { zh: '煮', en: 'Bol' } },
    steamed: { icon: '💭', color: 'from-indigo-300 to-indigo-400', label: { zh: '蒸', en: 'Stm' } },
    baked: { icon: '🔥', color: 'from-red-500 to-red-600', label: { zh: '烤', en: 'Bak' } },
    grilled: { icon: '🔥', color: 'from-red-600 to-red-700', label: { zh: '炙', en: 'Grl' } },
    burnt: { icon: '💀', color: 'from-stone-700 to-stone-800', label: { zh: '焦', en: 'Bnt' } },
    shaken: { icon: '🍸', color: 'from-cyan-400 to-cyan-500', label: { zh: '摇', en: 'Shk' } },
    stirred: { icon: '🥄', color: 'from-purple-400 to-purple-500', label: { zh: '搅', en: 'Str' } },
    layered: { icon: '📚', color: 'from-lime-400 to-lime-500', label: { zh: '层', en: 'Lay' } },
    iced: { icon: '🧊', color: 'from-sky-300 to-sky-400', label: { zh: '冰', en: 'Ice' } },
};

// 获取卡片的主题色 - 基于食材类别
const getCategoryTheme = (category?: string) => {
    switch (category) {
        case 'meat': return { bg: 'bg-gradient-to-br from-rose-50 to-rose-100', border: 'border-rose-200', shadow: 'shadow-rose-200/50' };
        case 'vegetable': return { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', border: 'border-emerald-200', shadow: 'shadow-emerald-200/50' };
        case 'fruit': return { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-200', shadow: 'shadow-amber-200/50' };
        case 'seafood': return { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', border: 'border-cyan-200', shadow: 'shadow-cyan-200/50' };
        case 'dairy': return { bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', border: 'border-yellow-200', shadow: 'shadow-yellow-200/50' };
        case 'grain': return { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-200', shadow: 'shadow-orange-200/50' };
        case 'seasoning': return { bg: 'bg-gradient-to-br from-violet-50 to-violet-100', border: 'border-violet-200', shadow: 'shadow-violet-200/50' };
        case 'liquid': return { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200', shadow: 'shadow-blue-200/50' };
        default: return { bg: 'bg-gradient-to-br from-stone-50 to-stone-100', border: 'border-stone-200', shadow: 'shadow-stone-200/50' };
    }
};

// 获取状态效果样式 - 简化并更有意义
const getStatusEffects = (statuses: ItemStatus[]): string => {
    const s = new Set(statuses);

    if (s.has('burnt')) return 'grayscale-[0.7] brightness-[0.5]';
    if (s.has('fried') || s.has('deep_fried') || s.has('stir_fried')) return 'saturate-[1.2] brightness-[0.95]';
    if (s.has('boiled') || s.has('steamed')) return 'brightness-[1.05] saturate-[0.95]';
    if (s.has('baked') || s.has('grilled')) return 'brightness-[0.9] contrast-[1.1]';
    if (s.has('marinated')) return 'saturate-[1.15]';
    if (s.has('dried') || s.has('dehydrated')) return 'brightness-[1.1] contrast-[1.15]';
    if (s.has('blended')) return 'blur-[0.5px]';

    return '';
};

export const DraggableIngredient: React.FC<DraggableIngredientProps> = ({
    item,
    language,
    disabled = false,
    onRemove,
    showStatus = true,
    sourceStation,
    className = '',
    onClick,
    compact = false,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: item.instanceId,
        data: { item, sourceStation },
        disabled,
    });

    // 状态变化时的弹跳动画
    const [isPopping, setIsPopping] = useState(false);
    useEffect(() => {
        if (item.statuses.length > 0 && item.statuses[0] !== 'raw') {
            setIsPopping(true);
            const t = setTimeout(() => setIsPopping(false), 300);
            return () => clearTimeout(t);
        }
    }, [item.statuses.length]);

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : undefined,
    };

    const categoryTheme = getCategoryTheme(item.category);
    const statusEffects = getStatusEffects(item.statuses || []);
    const isMerged = item.isMerged && item.mergedFrom;

    // 获取要显示的状态徽章（最多3个）
    const displayStatuses = (item.statuses || []).filter(s => s !== 'raw').slice(0, 3);

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            animate={isPopping ? { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
                relative
                w-20 h-24 sm:w-24 sm:h-28
                rounded-3xl
                ${categoryTheme.bg} ${categoryTheme.border}
                border-2
                shadow-lg ${categoryTheme.shadow}
                flex flex-col items-center justify-between
                py-2 px-1
                cursor-grab active:cursor-grabbing
                transition-all duration-200 ease-out
                group select-none
                ${isDragging
                    ? 'shadow-2xl scale-110 rotate-3 !opacity-90'
                    : 'hover:-translate-y-1.5 hover:shadow-xl hover:scale-[1.02]'
                }
                ${disabled ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none' : ''}
                ${statusEffects}
                ${className}
            `}
        >
            {/* 处理状态徽章 - 清晰可见 */}
            {showStatus && displayStatuses.length > 0 && (
                <div className="absolute -top-2 -left-1 flex gap-0.5 z-30 pointer-events-none">
                    {displayStatuses.map((status, i) => {
                        const statusInfo = STATUS_ICONS[status];
                        if (!statusInfo) return null;
                        return (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, y: -5 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`
                                    w-5 h-5 sm:w-6 sm:h-6 
                                    rounded-full 
                                    bg-gradient-to-br ${statusInfo.color} 
                                    flex items-center justify-center 
                                    text-[10px] sm:text-xs
                                    shadow-md border border-white/50
                                    ring-1 ring-white/30
                                `}
                                title={language === 'zh' ? statusInfo.label.zh : statusInfo.label.en}
                            >
                                {statusInfo.icon}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Emoji 区域 */}
            <div className="flex-1 flex items-center justify-center w-full overflow-visible">
                {isMerged ? (
                    <MergedEmojiDisplay item={item} size="md" className="scale-90" />
                ) : (
                    <motion.span
                        className="text-4xl sm:text-5xl filter drop-shadow-md"
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                    >
                        {item.emoji}
                    </motion.span>
                )}
            </div>

            {/* 名称标签 - 确保不被遮挡 */}
            <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl py-1 px-1.5 flex justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-700 truncate max-w-full leading-tight text-center">
                    {language === 'zh' ? (item.nameZh || item.name) : item.name}
                </span>
            </div>

            {/* 处理次数指示器 */}
            {item.processHistory && item.processHistory.length > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20"
                >
                    {item.processHistory.length}
                </motion.div>
            )}

            {/* 删除按钮 */}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-30"
                >
                    <span className="font-bold text-sm leading-none">×</span>
                </button>
            )}

            {/* 拖拽时的光晕效果 */}
            {isDragging && (
                <div className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse pointer-events-none" />
            )}
        </motion.div>
    );
};

export default DraggableIngredient;
