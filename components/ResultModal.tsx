

import React, { useRef, useState } from 'react';
import { DishResult, Customer, Language } from '../types';
import { X, RotateCcw, BookOpenCheck, DollarSign, Download, Share2 } from 'lucide-react';
import { t } from '../translations';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface ResultModalProps {
    result: DishResult | null;
    onClose: () => void;
    onReset: () => void;
    customer: Customer | null;
    isHistoryView?: boolean;
    language: Language;
    isSaved?: boolean;
    onToggleSave?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose, onReset, customer, isHistoryView = false, language, isSaved, onToggleSave }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    if (!result) return null;

    const isHighScoring = result.score >= 80;
    const isLowScoring = result.score <= 30;
    const isSatisfied = result.customerSatisfied;

    // Determine which customer data to show (History snapshot vs Current)
    const displayCustomerName = result.customerName || (language === 'zh' ? customer?.nameZh || customer?.name : customer?.name);
    const displayCustomerEmoji = result.customerEmoji || customer?.emoji;
    const hasCustomerInfo = !!(result.customerFeedback && displayCustomerName);
    const hasFinancials = result.revenue !== undefined;

    const getStatusLabel = (status: string, lang: Language) => {
        if (lang !== 'zh') return status.toUpperCase();
        const map: Record<string, string> = {
            'chopped': '切碎',
            'blended': '搅拌',
            'dried': '风干',
            'marinated': '腌制',
            'raw': '生'
        };
        return map[status] || status;
    };

    const handleShare = async () => {
        if (!cardRef.current || isSharing) return;

        setIsSharing(true);
        const toastId = toast.loading(language === 'zh' ? '正在生成卡片...' : 'Generating card...');

        try {
            // 等待图片加载完成（如果有）
            const images = cardRef.current.getElementsByTagName('img');
            await Promise.all(Array.from(images).map((imgEl) => {
                const img = imgEl as HTMLImageElement;
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));

            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                allowTaint: true, // 允许跨域图片
                scale: 2, // 高清
                backgroundColor: '#ffffff', // 强制白底，避免透明
                logging: false,
                // 排除忽略的元素
                ignoreElements: (element) => element.hasAttribute('data-html2canvas-ignore')
            });

            const link = document.createElement('a');
            link.download = `CookingGenius-${result.dishName}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(language === 'zh' ? '卡片已保存！' : 'Card saved!', { id: toastId });
        } catch (error) {
            console.error('Share failed:', error);
            toast.error(language === 'zh' ? '生成失败' : 'Failed to generate', { id: toastId });
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div
                ref={cardRef}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden slide-up flex flex-col max-h-[90vh]"
            >

                {/* Header Visual - Image or Emoji */}
                <div
                    className="w-full relative flex items-center justify-center overflow-hidden transition-all duration-500 group"
                    style={{
                        minHeight: result.imageUrl && !imageLoadFailed ? '240px' : '160px',
                        backgroundColor: result.imageUrl && !imageLoadFailed ? '#000' : (result.colorHex || '#8B5CF6')
                    }}
                >
                    {result.imageUrl && !imageLoadFailed ? (
                        <>
                            <img
                                src={result.imageUrl}
                                alt={result.dishName}
                                className="w-full h-full object-cover absolute inset-0 animate-[fadeIn_0.5s_ease-out]"
                                crossOrigin="anonymous"
                                onError={() => setImageLoadFailed(true)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="text-8xl drop-shadow-2xl filter transform hover:scale-110 transition-transform cursor-default z-10">
                                {result.emoji || '🍽️'}
                            </div>
                            {imageLoadFailed && (
                                <div className="text-white/70 text-xs mt-2">
                                    {language === 'zh' ? '图片加载失败' : 'Image failed to load'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Close Button - hide during capture if desired, using data-html2canvas-ignore */}
                    <button
                        onClick={onClose}
                        data-html2canvas-ignore
                        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-20 backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={onToggleSave}
                        data-html2canvas-ignore
                        className={`absolute top-4 left-4 p-2 rounded-full transition-all z-20 backdrop-blur-sm
                    ${isSaved ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-black/30 hover:bg-black/50 text-white'}
                `}
                        title={isSaved ? (language === 'zh' ? '取消收藏' : 'Unsave') : (language === 'zh' ? '收藏食谱' : 'Save Recipe')}
                    >
                        <span className={isSaved ? "animate-pulse" : ""}>❤️</span>
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        data-html2canvas-ignore
                        className="absolute top-4 left-16 p-2 rounded-full transition-all z-20 backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white"
                        title={language === 'zh' ? '保存卡片' : 'Save Card'}
                    >
                        {isSharing ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Download size={20} />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center flex-1 overflow-y-auto -mt-6 relative z-10 bg-white rounded-t-3xl">
                    <div className="mb-2">
                        {isHighScoring && <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">{t('chefsChoice', language)}</span>}
                        {isLowScoring && <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wide border border-red-200">{t('kitchenDisaster', language)}</span>}
                        {isHistoryView && <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full uppercase tracking-wide border border-stone-200 ml-2">{t('archived', language)}</span>}
                    </div>

                    <h2 className="text-2xl font-display font-bold text-stone-800 mb-1 leading-tight">
                        {result.dishName}
                    </h2>

                    <p className="text-stone-500 mb-4 leading-relaxed text-sm">
                        {result.description}
                    </p>

                    {/* Ingredients Display */}
                    {result.ingredients && result.ingredients.length > 0 && (
                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                            {result.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg border border-stone-100 text-xs text-stone-600 shadow-sm">
                                    <span>{ing.emoji}</span>
                                    <div className="flex items-center gap-1">
                                        {ing.status && <span className="bg-stone-200 px-1 rounded-[2px] text-[8px] uppercase tracking-wider text-stone-500 font-bold">{getStatusLabel(ing.status, language)}</span>}
                                        <span className="font-bold">{ing.name}</span>
                                        {ing.marinade && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full ml-0.5" title={`Marinated: ${ing.marinade}`}></span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Score Card & Rank */}
                    <div className="flex items-center justify-center gap-4 mb-4 px-4">
                        {/* Rank Badge */}
                        <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-4 ${(() => {
                            const score = result.score;
                            if (score >= 90) return 'bg-yellow-50 border-yellow-400 text-yellow-500';
                            if (score >= 80) return 'bg-purple-50 border-purple-400 text-purple-500';
                            if (score >= 70) return 'bg-blue-50 border-blue-400 text-blue-500';
                            if (score >= 60) return 'bg-green-50 border-green-400 text-green-500';
                            return 'bg-stone-100 border-stone-400 text-stone-500';
                        })()}`}>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-60">RANK</div>
                            <div className="text-5xl font-black leading-none -mt-1 font-display">
                                {(() => {
                                    const score = result.score;
                                    if (score >= 90) return 'S';
                                    if (score >= 80) return 'A';
                                    if (score >= 70) return 'B';
                                    if (score >= 60) return 'C';
                                    return 'D';
                                })()}
                            </div>
                        </div>

                        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-3 flex-1 shadow-sm h-20 flex flex-col justify-center">
                            <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">{t('tasteScore', language)}</div>
                            <div className={`text-4xl font-black ${isHighScoring ? 'text-chef-500' : isLowScoring ? 'text-stone-600' : 'text-stone-700'}`}>
                                {result.score}<span className="text-lg text-stone-300 font-normal ml-1">/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Section (Challenge Mode) */}
                    {hasFinancials && (
                        <div className="mb-4 bg-stone-50 border-y-2 border-dashed border-stone-200 p-3 font-mono text-sm relative">
                            <div className="flex justify-between items-center text-stone-500 mb-1">
                                <span>{t('ingredientCost', language)}</span>
                                <span className="text-red-500">-${result.cost}</span>
                            </div>
                            <div className="flex justify-between items-center text-stone-500 mb-1">
                                <span>{t('revenue', language)}</span>
                                <span className="text-green-600">+${result.revenue}</span>
                            </div>
                            {/* Late Penalty */}
                            {result.latePenalty && result.latePenalty > 0 && (
                                <div className="flex justify-between items-center text-stone-500 mb-1">
                                    <span>{t('latePenalty', language)}</span>
                                    <span className="text-red-600">-${result.latePenalty}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center font-bold text-lg border-t border-stone-200 pt-2 mt-2">
                                <span>{t('netProfit', language)}</span>
                                <span className={(result.profit || 0) >= 0 ? "text-stone-800" : "text-red-600"}>
                                    {(result.profit || 0) > 0 ? '+' : ''}{result.profit}
                                </span>
                            </div>
                            {/* Visual Stamp */}
                            {(result.profit || 0) > 20 && <div className="absolute -right-2 top-2 rotate-12 text-green-500/20 text-4xl font-black border-4 border-green-500/20 rounded-lg px-2 pointer-events-none">PROFIT</div>}
                        </div>
                    )}

                    {/* Customer Verdict */}
                    {hasCustomerInfo && (
                        <div className={`rounded-xl p-4 border relative mb-4 text-left ${isSatisfied ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-start gap-3">
                                <div className="text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm border border-stone-100 flex-shrink-0">
                                    {displayCustomerEmoji}
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <span className="text-stone-500">{displayCustomerName}</span>
                                        <span className="text-stone-300">•</span>
                                        {isSatisfied ? <span className="text-green-600">{t('satisfied', language)}</span> : <span className="text-red-600">{t('unhappy', language)}</span>}
                                    </div>
                                    <div className={`text-sm font-medium leading-snug italic ${isSatisfied ? 'text-green-800' : 'text-red-800'}`}>
                                        "{result.customerFeedback}"
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chef Comment */}
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 relative mt-4">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-0.5 rounded-full border border-amber-100 shadow-sm flex items-center gap-1">
                            <span className="text-xs font-bold text-amber-600">{t('chefSays', language)}</span>
                        </div>
                        <p className="text-amber-900 italic text-sm mt-1">
                            "{result.chefComment}"
                        </p>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-stone-50 border-t border-stone-100" data-html2canvas-ignore>
                    {isHistoryView ? (
                        <button
                            onClick={onClose}
                            className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <BookOpenCheck size={18} />
                            {t('closeEntry', language)}
                        </button>
                    ) : (
                        <button
                            onClick={onReset}
                            className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-stone-200"
                        >
                            <RotateCcw size={18} />
                            {customer ? t('nextCustomer', language) : t('cookSomethingElse', language)}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};