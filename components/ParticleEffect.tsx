import React, { useEffect, useState } from 'react';
import { AnyCookingMethod, HeatMethod, PrepMethod, MixMethod, MarinateMethod } from '../types';

interface ParticleEffectProps {
    method: AnyCookingMethod | null;
    isActive: boolean;
    className?: string;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    delay: number;
}

/**
 * 粒子效果组件 - 根据烹饪方法显示对应的视觉粒子
 */
export const ParticleEffect: React.FC<ParticleEffectProps> = ({
    method,
    isActive,
    className = ''
}) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    // 生成粒子
    useEffect(() => {
        if (!isActive || !method) {
            setParticles([]);
            return;
        }

        const particleCount = getParticleCount(method);
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: 20 + Math.random() * 60, // 20-80% 范围内
                y: 30 + Math.random() * 40, // 30-70% 范围内
                delay: Math.random() * 2, // 0-2s 延迟
            });
        }

        setParticles(newParticles);
    }, [isActive, method]);

    if (!isActive || !method) return null;

    const particleClass = getParticleClass(method);
    if (!particleClass) return null;

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className={particleClass}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

// 根据方法获取粒子数量
const getParticleCount = (method: AnyCookingMethod): number => {
    switch (method) {
        case HeatMethod.FRY:
        case HeatMethod.DEEP_FRY:
        case HeatMethod.STIR_FRY:
            return 8; // 火焰粒子
        case HeatMethod.BOIL:
        case HeatMethod.STEAM:
            return 6; // 蒸汽粒子
        case HeatMethod.BAKE:
        case HeatMethod.GRILL:
            return 5; // 热浪粒子
        case PrepMethod.CHOP:
        case PrepMethod.SLICE:
            return 4; // 刀光粒子
        case MixMethod.SHAKE:
            return 3; // 液体飞溅
        default:
            return 0;
    }
};

// 根据方法获取粒子类名
const getParticleClass = (method: AnyCookingMethod): string | null => {
    switch (method) {
        case HeatMethod.FRY:
        case HeatMethod.DEEP_FRY:
        case HeatMethod.STIR_FRY:
        case HeatMethod.GRILL:
            return 'particle-flame';
        case HeatMethod.BOIL:
        case HeatMethod.STEAM:
        case HeatMethod.BRAISE:
            return 'particle-steam';
        case HeatMethod.BAKE:
            return 'particle-steam'; // 使用蒸汽粒子表示热气
        case PrepMethod.CHOP:
        case PrepMethod.SLICE:
        case PrepMethod.JULIENNE:
            return 'particle-spark';
        case MixMethod.SHAKE:
        case MixMethod.STIR:
            return 'particle-water';
        default:
            return null;
    }
};

/**
 * 简单的蒸汽效果组件 - 用于烹饪中的食材
 */
export const SteamEffect: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="text-lg opacity-60 animate-steam"
                    style={{ animationDelay: `${i * 0.3}s` }}
                >
                    ♨️
                </div>
            ))}
        </div>
    );
};

/**
 * 火焰效果组件
 */
export const FlameEffect: React.FC<{ intensity?: 'low' | 'medium' | 'high' }> = ({
    intensity = 'medium'
}) => {
    const flameCount = intensity === 'low' ? 2 : intensity === 'medium' ? 4 : 6;

    return (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
            {Array.from({ length: flameCount }).map((_, i) => (
                <div
                    key={i}
                    className="text-lg animate-bounce"
                    style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.3s'
                    }}
                >
                    🔥
                </div>
            ))}
        </div>
    );
};

export default ParticleEffect;
