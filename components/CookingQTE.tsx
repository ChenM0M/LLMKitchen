import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, X, Check } from 'lucide-react';
import { audioService } from '../services/audioService';
import { QTERating, QTEDifficulty, Language } from '../types';

interface CookingQTEProps {
    isActive: boolean;
    onComplete: (rating: QTERating) => void;
    onCancel: () => void;
    language: Language;
    methodName?: string;
    difficulty?: QTEDifficulty;
}

// 等级配置
export const QTE_RATINGS: Record<string, {
    label: { zh: string; en: string };
    color: string;
    bgGradient: string;
    scoreMultiplier: number;
    icon: string;
}> = {
    failed: {
        label: { zh: '失败', en: 'Failed' },
        color: 'text-red-600',
        bgGradient: 'from-red-900 to-red-700',
        scoreMultiplier: 0.5,
        icon: '❌'
    },
    poor: {
        label: { zh: '差', en: 'Poor' },
        color: 'text-orange-600',
        bgGradient: 'from-orange-900 to-orange-700',
        scoreMultiplier: 0.7,
        icon: '⚠️'
    },
    mediocre: {
        label: { zh: '一般', en: 'Mediocre' },
        color: 'text-yellow-600',
        bgGradient: 'from-yellow-900 to-yellow-700',
        scoreMultiplier: 0.9,
        icon: '😐'
    },
    normal: {
        label: { zh: '正常', en: 'Normal' },
        color: 'text-blue-600',
        bgGradient: 'from-blue-900 to-blue-700',
        scoreMultiplier: 1.0,
        icon: '👌'
    },
    excellent: {
        label: { zh: '优秀', en: 'Excellent' },
        color: 'text-purple-600',
        bgGradient: 'from-purple-900 to-purple-700',
        scoreMultiplier: 1.2,
        icon: '✨'
    },
    perfect: {
        label: { zh: '完美', en: 'Perfect' },
        color: 'text-amber-500',
        bgGradient: 'from-amber-600 to-yellow-500',
        scoreMultiplier: 1.5,
        icon: '👑'
    }
};

// 难度配置
export const QTE_DIFFICULTY_CONFIG: Record<QTEDifficulty, {
    label: { zh: string; en: string };
    beatCount: number;
    beatInterval: number;
    perfectWindow: number;
    goodWindow: number;
    okWindow: number;
    randomRange: number; // 随机范围 (百分比 0-100)
}> = {
    none: {
        label: { zh: '关闭', en: 'Off' },
        beatCount: 0,
        beatInterval: 0,
        perfectWindow: 0,
        goodWindow: 0,
        okWindow: 0,
        randomRange: 0
    },
    easy: {
        label: { zh: '简单', en: 'Easy' },
        beatCount: 4,
        beatInterval: 1200, // 慢节拍
        perfectWindow: 200, // 非常宽松
        goodWindow: 350,
        okWindow: 500,
        randomRange: 0 // 判定线固定在中心
    },
    normal: {
        label: { zh: '普通', en: 'Normal' },
        beatCount: 5,
        beatInterval: 1000, // 适中节拍
        perfectWindow: 140, // 适中窗口
        goodWindow: 250,
        okWindow: 400,
        randomRange: 15 // 判定线微移 (±15%)
    },
    hard: {
        label: { zh: '困难', en: 'Hard' },
        beatCount: 7,
        beatInterval: 700, // 快节拍
        perfectWindow: 80, // 严格窗口
        goodWindow: 150,
        okWindow: 250,
        randomRange: 35 // 判定线大幅移动 (±35%)
    }
};

// 根据难度获取随机目标位置
const getRandomTargetPosition = (difficulty: QTEDifficulty) => {
    const range = QTE_DIFFICULTY_CONFIG[difficulty].randomRange / 100;
    return 0.5 - range / 2 + Math.random() * range;
};

export const CookingQTE: React.FC<CookingQTEProps> = ({
    isActive,
    onComplete,
    onCancel,
    language,
    methodName,
    difficulty = 'normal'
}) => {
    // 根据难度获取配置
    const config = QTE_DIFFICULTY_CONFIG[difficulty];
    const BEAT_COUNT = config.beatCount;
    const BEAT_INTERVAL = config.beatInterval;
    const PERFECT_WINDOW = config.perfectWindow;
    const GOOD_WINDOW = config.goodWindow;
    const OK_WINDOW = config.okWindow;

    const [currentBeat, setCurrentBeat] = useState(0);
    const [beatResults, setBeatResults] = useState<('perfect' | 'good' | 'ok' | 'miss')[]>([]);
    const [showBeatIndicator, setShowBeatIndicator] = useState(false);
    const [beatTime, setBeatTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [finalRating, setFinalRating] = useState<QTERating | null>(null);
    const [lastHitResult, setLastHitResult] = useState<'perfect' | 'good' | 'ok' | 'miss' | null>(null);
    const [showHitEffect, setShowHitEffect] = useState(false);
    const [targetPosition, setTargetPosition] = useState(0.5); // 随机目标位置

    const beatTimerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const hasClickedRef = useRef(false);

    // 计算最终评级
    const calculateRating = useCallback((results: ('perfect' | 'good' | 'ok' | 'miss')[]): QTERating => {
        const perfectCount = results.filter(r => r === 'perfect').length;
        const goodCount = results.filter(r => r === 'good').length;
        const okCount = results.filter(r => r === 'ok').length;
        const missCount = results.filter(r => r === 'miss').length;

        // 加权分数
        const score = (perfectCount * 3 + goodCount * 2 + okCount * 1) / (BEAT_COUNT * 3);

        if (missCount >= 3) return 'failed';
        if (score >= 0.9 && missCount === 0) return 'perfect';
        if (score >= 0.75) return 'excellent';
        if (score >= 0.5) return 'normal';
        if (score >= 0.3) return 'mediocre';
        if (score >= 0.1) return 'poor';
        return 'failed';
    }, [BEAT_COUNT]);

    // 开始节拍
    useEffect(() => {
        if (!isActive) return;

        setCurrentBeat(0);
        setBeatResults([]);
        setIsFinished(false);
        setFinalRating(null);

        const runBeat = (beatIndex: number) => {
            if (beatIndex >= BEAT_COUNT) {
                // 所有节拍完成
                setIsFinished(true);
                return;
            }

            setCurrentBeat(beatIndex);
            setShowBeatIndicator(true);
            setTargetPosition(getRandomTargetPosition(difficulty as QTEDifficulty)); // 随机目标位置
            startTimeRef.current = Date.now();
            hasClickedRef.current = false;
            setBeatTime(0);

            // 节拍动画计时
            const animTimer = setInterval(() => {
                setBeatTime(Date.now() - startTimeRef.current);
            }, 16);

            // 下一个节拍
            beatTimerRef.current = setTimeout(() => {
                clearInterval(animTimer);
                setShowBeatIndicator(false);

                // 如果没点击，记录 miss
                if (!hasClickedRef.current) {
                    setBeatResults(prev => [...prev, 'miss']);
                }

                // 短暂延迟后开始下一个节拍
                setTimeout(() => runBeat(beatIndex + 1), 200);
            }, BEAT_INTERVAL);
        };

        // 初始延迟后开始
        const startDelay = setTimeout(() => runBeat(0), 500);

        return () => {
            clearTimeout(startDelay);
            if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
        };
    }, [isActive, BEAT_COUNT, BEAT_INTERVAL, difficulty]);

    // 处理完成
    useEffect(() => {
        if (isFinished && beatResults.length === BEAT_COUNT) {
            const rating = calculateRating(beatResults);
            setFinalRating(rating);

            // 延迟后返回结果
            const timer = setTimeout(() => {
                onComplete(rating);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isFinished, beatResults, calculateRating, onComplete, BEAT_COUNT]);

    // 处理点击
    const handleClick = useCallback(() => {
        if (!showBeatIndicator || hasClickedRef.current || isFinished) return;

        hasClickedRef.current = true;
        const elapsed = Date.now() - startTimeRef.current;
        const targetTime = BEAT_INTERVAL * targetPosition; // 使用随机目标位置
        const diff = Math.abs(elapsed - targetTime);

        let result: 'perfect' | 'good' | 'ok' | 'miss';
        if (diff <= PERFECT_WINDOW) {
            result = 'perfect';
            audioService.playSuccess(); // 完美音效
        } else if (diff <= GOOD_WINDOW) {
            result = 'good';
            audioService.playClick(); // 好的音效
        } else if (diff <= OK_WINDOW) {
            result = 'ok';
            audioService.playClick();
        } else {
            result = 'miss';
            audioService.playDelete(); // 失败音效
        }

        // 显示视觉反馈
        setLastHitResult(result);
        setShowHitEffect(true);
        setTimeout(() => setShowHitEffect(false), 300);

        setBeatResults(prev => [...prev, result]);
    }, [showBeatIndicator, isFinished, BEAT_INTERVAL, PERFECT_WINDOW, GOOD_WINDOW, OK_WINDOW, targetPosition]);

    if (!isActive) return null;

    const progress = beatTime / BEAT_INTERVAL;
    const isInPerfectZone = Math.abs(progress - targetPosition) < (PERFECT_WINDOW / BEAT_INTERVAL);
    const isInGoodZone = Math.abs(progress - targetPosition) < (GOOD_WINDOW / BEAT_INTERVAL);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={handleClick}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-stone-900 rounded-3xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 背景装饰 */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
                    </div>

                    {/* 取消按钮 */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onCancel(); }}
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        {/* 标题 */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Flame className="text-orange-400" size={28} />
                            <h2 className="text-2xl font-bold text-white">
                                {methodName || (language === 'zh' ? '烹饪中' : 'Cooking')}
                            </h2>
                        </div>

                        {/* 节拍进度指示 */}
                        <div className="flex justify-center gap-2 mb-6">
                            {Array.from({ length: BEAT_COUNT }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full transition-all ${i < beatResults.length
                                        ? beatResults[i] === 'perfect' ? 'bg-purple-500 scale-125'
                                            : beatResults[i] === 'good' ? 'bg-blue-500'
                                                : beatResults[i] === 'ok' ? 'bg-green-500'
                                                    : 'bg-red-500'
                                        : i === currentBeat && showBeatIndicator
                                            ? 'bg-yellow-400 animate-pulse scale-110'
                                            : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* 节拍区域 */}
                        {!isFinished ? (
                            <div
                                className="relative h-32 bg-stone-800 rounded-2xl overflow-hidden cursor-pointer mb-6"
                                onClick={handleClick}
                            >
                                {/* 目标区域 - 动态位置 */}
                                <div
                                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-green-500/30 to-transparent transition-all duration-300"
                                    style={{ left: `${targetPosition * 100}%`, transform: 'translateX(-50%)' }}
                                />
                                <div
                                    className="absolute top-0 bottom-0 w-4 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent transition-all duration-300"
                                    style={{ left: `${targetPosition * 100}%`, transform: 'translateX(-50%)' }}
                                />

                                {/* 移动的节拍条 */}
                                {showBeatIndicator && (
                                    <motion.div
                                        className={`absolute top-2 bottom-2 w-3 rounded-full ${isInPerfectZone ? 'bg-purple-400 shadow-lg shadow-purple-500/50'
                                            : isInGoodZone ? 'bg-blue-400'
                                                : 'bg-orange-400'
                                            }`}
                                        style={{
                                            left: `${progress * 100}%`,
                                            transform: 'translateX(-50%)'
                                        }}
                                    />
                                )}

                                {/* 目标线 - 动态位置 */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-white/60 transition-all duration-300"
                                    style={{ left: `${targetPosition * 100}%`, transform: 'translateX(-50%)' }}
                                />

                                {/* 点击反馈效果 */}
                                {showHitEffect && lastHitResult && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 1 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black ${lastHitResult === 'perfect' ? 'text-purple-400' :
                                            lastHitResult === 'good' ? 'text-blue-400' :
                                                lastHitResult === 'ok' ? 'text-green-400' : 'text-red-400'
                                            }`}
                                    >
                                        {lastHitResult === 'perfect' ? '完美!' :
                                            lastHitResult === 'good' ? '好!' :
                                                lastHitResult === 'ok' ? 'OK' : '❌'}
                                    </motion.div>
                                )}

                                {/* 点击提示 */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-white/30 text-lg font-bold">
                                        {language === 'zh' ? '点击!' : 'TAP!'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* 结果展示 */
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="py-8"
                            >
                                {finalRating && QTE_RATINGS[finalRating] && (
                                    <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${QTE_RATINGS[finalRating].bgGradient}`}>
                                        <div className="text-4xl mb-2">{QTE_RATINGS[finalRating].icon}</div>
                                        <div className="text-2xl font-black text-white">
                                            {QTE_RATINGS[finalRating].label[language]}
                                        </div>
                                        <div className="text-white/70 text-sm mt-1">
                                            x{QTE_RATINGS[finalRating].scoreMultiplier.toFixed(1)}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* 提示 */}
                        {!isFinished && (
                            <p className="text-white/50 text-sm">
                                {language === 'zh'
                                    ? '在节拍到达中心时点击获得最佳评分！'
                                    : 'Tap when the beat reaches the center for best score!'}
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CookingQTE;
