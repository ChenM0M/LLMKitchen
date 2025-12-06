import React from 'react';
import { KitchenItem } from '../types';

interface MergedEmojiDisplayProps {
    item: KitchenItem;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * 合并食材的emoji显示组件
 * 将多个食材的emoji限制在单个emoji大小范围内显示
 */
export const MergedEmojiDisplay: React.FC<MergedEmojiDisplayProps> = ({
    item,
    size = 'md',
    className = '',
}) => {
    // 尺寸映射
    const sizeMap = {
        sm: { container: 'w-8 h-8', emoji: 'text-sm', grid: 'gap-0.5' },
        md: { container: 'w-12 h-12', emoji: 'text-lg', grid: 'gap-0.5' },
        lg: { container: 'w-16 h-16', emoji: 'text-2xl', grid: 'gap-1' },
    };

    const { container, emoji, grid } = sizeMap[size];

    // 如果不是合并食材，直接显示单个emoji
    if (!item.isMerged || !item.mergedFrom || item.mergedFrom.length <= 1) {
        return (
            <div className={`${container} flex items-center justify-center ${className}`}>
                <span className={emoji}>{item.emoji}</span>
            </div>
        );
    }

    const emojis = item.mergedFrom;
    const count = emojis.length;

    // 根据数量决定布局
    const getGridClass = (count: number): string => {
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-3';
        return 'grid-cols-3'; // 最多显示9个
    };

    const getEmojiSize = (count: number): string => {
        if (count === 2) return 'text-xs';
        if (count <= 4) return 'text-[10px]';
        return 'text-[8px]';
    };

    // 最多显示9个emoji
    const displayEmojis = emojis.slice(0, 9);
    const remaining = emojis.length - 9;

    return (
        <div className={`${container} relative ${className}`}>
            {/* 合并效果背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-lg blur-sm" />

            {/* Emoji网格 */}
            <div className={`relative w-full h-full grid ${getGridClass(count)} ${grid} p-0.5 items-center justify-items-center`}>
                {displayEmojis.map((emojiChar, idx) => (
                    <span
                        key={idx}
                        className={`${getEmojiSize(count)} leading-none filter drop-shadow-sm`}
                        style={{
                            transform: `rotate(${(idx - count / 2) * 5}deg)`,
                            animation: `float ${1 + idx * 0.2}s ease-in-out infinite ${idx * 0.1}s`
                        }}
                    >
                        {emojiChar}
                    </span>
                ))}
            </div>

            {/* 如果有更多食材，显示数量 */}
            {remaining > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    +{remaining}
                </div>
            )}

            {/* 合并指示器 */}
            <div className="absolute -top-1 -left-1 bg-purple-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                🔄
            </div>
        </div>
    );
};

/**
 * 切碎效果：多个小块分散排列
 */
export const ChoppedEmojiDisplay: React.FC<{
    emoji: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}> = ({ emoji, size = 'md', className = '' }) => {
    const sizeMap = {
        sm: { container: 'w-8 h-8', piece: 'text-[10px]' },
        md: { container: 'w-12 h-12', piece: 'text-xs' },
        lg: { container: 'w-16 h-16', piece: 'text-sm' },
    };

    const { container, piece } = sizeMap[size];

    // 生成6-8个小块
    const pieces = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,  // 15-85% 范围
        y: 15 + Math.random() * 70,
        rotate: Math.random() * 60 - 30, // -30 到 30 度
        scale: 0.8 + Math.random() * 0.4, // 0.8-1.2
        delay: i * 0.1,
    }));

    return (
        <div className={`${container} relative ${className}`}>
            {pieces.map((p) => (
                <span
                    key={p.id}
                    className={`${piece} absolute filter drop-shadow-sm animate-pulse-slow`}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        transform: `translate(-50%, -50%) rotate(${p.rotate}deg) scale(${p.scale})`,
                        animationDelay: `${p.delay}s`,
                    }}
                >
                    {emoji}
                </span>
            ))}
            {/* 切割线效果 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-stone-300/50 rotate-12" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-stone-300/50 -rotate-6" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-300/50 rotate-6" />
            </div>
        </div>
    );
};

/**
 * 获取食材状态对应的视觉效果类
 */
export const getStatusVisualClass = (item: KitchenItem): string => {
    const statuses = item.statuses || [item.status || 'raw'];
    const classes: string[] = [];

    if (statuses.includes('chopped') || statuses.includes('sliced') || statuses.includes('julienned')) {
        classes.push('animate-pulse-slow');
    }
    if (statuses.includes('fried') || statuses.includes('deep_fried') || statuses.includes('stir_fried')) {
        classes.push('filter-fried animate-sizzle');
    }
    if (statuses.includes('boiled') || statuses.includes('steamed')) {
        classes.push('filter-boiled');
    }
    if (statuses.includes('dried') || statuses.includes('dehydrated')) {
        classes.push('filter-dried');
    }
    if (statuses.includes('marinated') || statuses.includes('brined')) {
        classes.push('filter-marinated');
    }
    if (statuses.includes('blended') || statuses.includes('mashed')) {
        classes.push('filter-blended');
    }
    if (statuses.includes('baked') || statuses.includes('grilled')) {
        classes.push('animate-pulse-glow');
    }

    return classes.join(' ');
};

export default MergedEmojiDisplay;
