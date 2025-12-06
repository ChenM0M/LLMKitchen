import React, { forwardRef } from 'react';
import { DishIngredient } from '../types';
import { ChefHat, Quote } from 'lucide-react';
import { JUDGE_PERSONAS } from '../constants';

interface ExportCardProps {
    result: {
        dishName: string;
        description: string;
        emoji: string;
        score: number;
        chefComment: string;
        customerFeedback?: string;
        customerSatisfied?: boolean;
        colorHex?: string;
        imageUrl?: string;
        ingredients?: DishIngredient[];
        customerName?: string;
        customerEmoji?: string;
        judgePersonaId?: string;
        cost?: number;
        revenue?: number;
        latePenalty?: number;
        profit?: number;
    };
    language: 'zh' | 'en';
}

const t = (key: string, lang: 'zh' | 'en') => {
    const translations: Record<string, { en: string; zh: string }> = {
        chefsChoice: { en: "Chef's Choice", zh: "主厨精选" },
        kitchenDisaster: { en: "Kitchen Disaster", zh: "厨房灾难" },
        archived: { en: "Archived", zh: "已归档" },
        tasteScore: { en: "Taste Score", zh: "美味评分" },
        chefSays: { en: "Chef's Verdict", zh: "主厨点评" },
        ingredients: { en: "Ingredients", zh: "核心食材" },
        rank: { en: "Rank", zh: "评级" },
    };
    return lang === 'zh' ? translations[key]?.zh || key : translations[key]?.en || key;
};

export const ExportCard = forwardRef<HTMLDivElement, ExportCardProps>(({ result, language }, ref) => {
    const isZh = language === 'zh';
    const judgePersona = JUDGE_PERSONAS[result.judgePersonaId as keyof typeof JUDGE_PERSONAS];
    const accentColor = result.colorHex || '#F59E0B';

    return (
        <div
            ref={ref}
            className="relative flex flex-col overflow-hidden text-stone-900"
            style={{
                width: '540px',
                height: '1080px',
                backgroundColor: '#F7F5F0',
                fontFamily: isZh ? '"Noto Serif SC", serif' : '"Playfair Display", serif',
            }}
        >
            {/* 1. Background (Clean & Subtle) */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundColor: '#FAFAF9',
                    backgroundImage: `radial-gradient(${accentColor}15 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* Soft Ambient Mesh */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{ background: `radial-gradient(circle at 100% 0%, ${accentColor}20 0%, transparent 50%), radial-gradient(circle at 0% 100%, ${accentColor}10 0%, transparent 50%)` }}>
            </div>

            {/* 2. Header (Compact) */}
            <div className="relative z-20 px-10 pt-6 pb-2 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <ChefHat size={16} className="text-stone-900" />
                    <span className="text-xs tracking-[0.2em] uppercase text-stone-900 font-sans font-bold">Cooking Gen.</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-base grayscale opacity-50">{result.emoji}</span>
                    <span className="text-xs font-bold tracking-widest text-stone-400 font-sans uppercase">
                        NO. {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                    </span>
                </div>
            </div>

            {/* 3. Hero Visual (Natural Aspect Ratio) */}
            <div className="relative z-10 px-8 shrink-0 flex justify-center mb-4">
                <div className="relative w-full h-[480px] rounded-t-[240px] rounded-b-[24px] overflow-hidden shadow-2xl group border-[4px] border-white z-10 bg-stone-100">
                    {result.imageUrl ? (
                        <img
                            src={result.imageUrl}
                            alt={result.dishName}
                            className="w-full h-full object-cover object-center"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-200">
                            <span className="text-9xl grayscale opacity-20">{result.emoji}</span>
                        </div>
                    )}
                </div>

                {/* Rank Badge - Circular Stamp Style */}
                <div className="absolute top-4 right-12 z-20 filter drop-shadow-xl transform rotate-12">
                    <div className="w-20 h-20 rounded-full bg-white border-[3px] flex flex-col items-center justify-center shadow-sm"
                        style={{ borderColor: accentColor }}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-none mb-0.5">RANK</span>
                        {/* Reduced size to text-4xl to ensure the letter fits entirely inside the circle */}
                        <span className="text-4xl font-black leading-none text-stone-900 pb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {result.score >= 90 ? 'S' : result.score >= 80 ? 'A' : result.score >= 60 ? 'B' : 'C'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. Content Body - Optimized Spacing */}
            <div className="relative z-20 flex-1 px-10 pb-8 flex flex-col min-h-0">

                {/* A. Title & Score Group (Reduced Size for Space) */}
                <div className="flex items-baseline justify-between gap-4 shrink-0 mb-3">
                    <h1 className="text-5xl font-black text-stone-900 leading-[1.1] tracking-tight break-words flex-1 -ml-0.5"
                        style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>
                        {result.dishName}
                    </h1>
                    <div className="flex flex-col items-end shrink-0 pl-4">
                        <span className="text-6xl font-black leading-[0.8]" style={{ color: accentColor, fontFamily: '"Playfair Display", serif' }}>{result.score}</span>
                    </div>
                </div>

                {/* B. Ingredients (Compact) */}
                <div className="mb-4 shrink-0 -mt-1 pl-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {result.ingredients?.map((ing, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 group/ing">
                                <span className="text-sm opacity-60 leading-none grayscale group-hover/ing:grayscale-0 transition-all">{ing.emoji}</span>
                                <span className="text-sm font-bold text-stone-600 font-sans leading-none pt-[1px] border-b border-stone-300/50 group-hover/ing:border-stone-400 transition-all">
                                    {isZh ? (ing.nameZh || ing.name) : ing.name}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* C. Description (Compact) */}
                <div className="mb-4 shrink-0">
                    <p className="text-[14px] text-stone-700 leading-relaxed text-left font-medium line-clamp-3">
                        {result.description}
                    </p>
                </div>

                {/* D. Judge's Verdict (Maximized Space) */}
                <div className="flex-1 min-h-0 bg-white rounded-r-xl border-l-[8px] p-5 relative flex flex-col shadow-sm overflow-hidden"
                    style={{ borderColor: accentColor }}>

                    <div className="absolute -bottom-6 -right-6 opacity-[0.07] pointer-events-none transform rotate-12" style={{ color: accentColor }}>
                        <Quote size={140} fill="currentColor" />
                    </div>

                    <div className="flex items-center gap-3 mb-2 shrink-0 relative z-10">
                        <div className="w-9 h-9 rounded-full bg-stone-50 flex items-center justify-center text-lg border border-stone-100 shadow-sm text-stone-800">
                            {judgePersona?.emoji || '👨‍🍳'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Judge's Verdict</span>
                            <span className="text-[15px] font-black text-stone-800 uppercase tracking-wide">
                                {judgePersona?.name[language] || t('chefSays', language)}
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 flex-1 overflow-hidden">
                        <p className="text-[15px] leading-7 italic font-serif text-stone-600 font-medium whitespace-pre-wrap">
                            "{result.chefComment}"
                        </p>
                    </div>
                </div>

            </div>

            {/* Footer Bar */}
            <div className="h-1.5 w-full flex shrink-0">
                <div className="flex-1 bg-stone-200"></div>
                <div className="w-1/3" style={{ backgroundColor: accentColor }}></div>
            </div>
        </div>
    );
});

ExportCard.displayName = 'ExportCard';
