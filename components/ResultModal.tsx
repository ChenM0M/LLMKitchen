

import React, { useRef, useState } from 'react';
import { DishResult, Customer, Language } from '../types';
import { X, RotateCcw, BookOpenCheck, DollarSign, Download, Share2 } from 'lucide-react';
import { t } from '../translations';
import { JUDGE_PERSONAS } from '../constants';
import { apiSettings } from '../services/apiSettings';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { ExportCard } from './ExportCard';
import { Pencil, Check, Copy } from 'lucide-react';

interface ResultModalProps {
    result: DishResult | null;
    onClose: () => void;
    onReset: () => void; // This prop is still present in the original code, but the diff implies it might be removed. Keeping it as per "without making any unrelated edits"
    customer: Customer | null; // This prop is still present in the original code, but the diff implies it might be removed. Keeping it as per "without making any unrelated edits"
    isHistoryView?: boolean; // This prop is still present in the original code, but the diff implies it might be removed. Keeping it as per "without making any unrelated edits"
    language: Language;
    isSaved?: boolean; // This prop is still present in the original code, but the diff implies it might be removed. Keeping it as per "without making any unrelated edits"
    onToggleSave?: () => void; // This prop is still present in the original code, but the diff implies it might be removed. Keeping it as per "without making any unrelated edits"
    isOpen: boolean; // Added as per diff
    onRetry?: () => void; // Added as per diff (implied by usage in component signature)
    onUpdateDish?: (dish: DishResult, updates: Partial<DishResult>) => void; // 用于更新菜名等信息
}

// 为旧菜品生成备用提示词（用于复制功能）
const generateFallbackPrompt = (result: DishResult, language: Language): string => {
    const ingredientDesc = result.ingredients?.map(ing => {
        const statusStr = ing.statuses?.filter(s => s !== 'raw').join(' ') || '';
        return statusStr ? `${statusStr.toUpperCase()} ${ing.name}` : ing.name;
    }).join('; ') || result.dishName;

    const prompt = `(masterpiece, best quality, photorealistic:1.4), 8k uhd, dslr, soft cinematic lighting, 35mm lens, f/1.8, high fidelity,
Subject: ${result.dishName}
${result.description ? `Description: ${result.description}` : ''}
Ingredients: ${ingredientDesc}
Cooking precision: ${result.cookingPrecision || 'perfect'}
Score: ${result.score}/100

RESTRICTIONS:
- NO text, no watermark, no labels
- Clean background, center composition
- Food photography style, appetizing, delicious`.trim();

    return prompt;
};

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose, onReset, customer, isHistoryView = false, language, isSaved, onToggleSave, onUpdateDish }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const exportCardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    if (!result) return null;

    // 获取显示名称（优先使用自定义名称）
    const displayDishName = result.customName || result.dishName;

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
        if (!exportCardRef.current || isSharing) return;

        setIsSharing(true);
        const toastId = toast.loading(language === 'zh' ? '正在生成精美卡片...' : 'Generating premium card...');

        // Get the hidden container that wraps ExportCard
        const hiddenContainer = exportCardRef.current.parentElement;

        try {
            // STEP 1: Keep the card off-screen but with full dimensions (no visible flash)
            // We don't move it to visible anymore to avoid the flash
            const originalStyles = hiddenContainer?.getAttribute('style') || '';

            // Ensure it has dimensions but stays off-screen
            if (hiddenContainer) {
                hiddenContainer.setAttribute('style', `
                    position: fixed;
                    left: -500px;
                    top: 0;
                    z-index: -1;
                    opacity: 1;
                    pointer-events: none;
                    width: 450px;
                    height: 780px;
                    overflow: visible;
                    background: white;
                `);
            }

            // STEP 2: Wait for images inside ExportCard to fully load
            const images = exportCardRef.current.getElementsByTagName('img');
            await Promise.all(Array.from(images).map((imgEl) => {
                const img = imgEl as HTMLImageElement;
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = () => {
                        // If image fails to load, set a placeholder
                        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                        resolve(undefined);
                    };
                    setTimeout(resolve, 3000); // 3s timeout
                });
            }));

            // Add delay to ensure paint
            await new Promise(resolve => setTimeout(resolve, 200));

            // STEP 3: Capture using html2canvas with ignoreElements for problematic images
            const canvas = await html2canvas(exportCardRef.current, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true, // Enable logging to debug
                imageTimeout: 5000, // Wait up to 5s for images
                onclone: (doc) => {
                    // Force all images in the cloned document to have dimensions
                    const clonedImages = doc.getElementsByTagName('img');
                    Array.from(clonedImages).forEach(img => {
                        if (!img.naturalWidth || img.naturalWidth === 0) {
                            // Replace broken images with a colored div
                            const placeholder = doc.createElement('div');
                            placeholder.style.cssText = `
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
                            `;
                            img.parentNode?.replaceChild(placeholder, img);
                        }
                    });
                }
            });

            // STEP 4: Restore hidden state
            if (hiddenContainer) {
                hiddenContainer.setAttribute('style', originalStyles);
            }

            const link = document.createElement('a');
            link.download = `CookingGenius-Premium-${displayDishName}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(language === 'zh' ? '精美卡片已保存！' : 'Premium card saved!', { id: toastId });
        } catch (error) {
            console.error('Share failed:', error);
            // Restore even on error
            if (hiddenContainer) {
                hiddenContainer.setAttribute('style', `
                    position: fixed; left: 200vw; top: 0; opacity: 1; z-index: -9999;
                    pointer-events: none; width: 450px; height: 780px; overflow: hidden; background: white;
                `);
            }
            toast.error(language === 'zh' ? '生成失败，请重试' : 'Failed, please try again', { id: toastId });
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

            {/* Hidden Export Card - Rendered OFF-SCREEN but with physical dimensions (Safe Strategy) */}
            <div style={{
                position: 'fixed',
                left: '200vw', // Far off-screen right
                top: '0',
                opacity: 1, // Keep opacity 1 to ensure rendering, but it's off-screen
                zIndex: -9999,
                pointerEvents: 'none',
                width: '450px',
                height: '780px',
                overflow: 'hidden',
                background: 'white' // Ensure background exists
            }} aria-hidden="true">
                <ExportCard
                    ref={exportCardRef}
                    result={result}
                    language={language}
                />
            </div>

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

                    {/* Copy Prompt Button - 有提示词或有图片时显示 */}
                    {(result.imagePrompt || result.imageUrl) && (
                        <button
                            onClick={() => {
                                // 优先使用保存的提示词，否则生成备用提示词
                                const promptToCopy = result.imagePrompt || generateFallbackPrompt(result, language);
                                navigator.clipboard.writeText(promptToCopy);
                                toast.success(language === 'zh' ? '提示词已复制！' : 'Prompt copied!');
                            }}
                            data-html2canvas-ignore
                            className="absolute top-4 left-28 p-2 rounded-full transition-all z-20 backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white"
                            title={language === 'zh' ? '复制提示词' : 'Copy Prompt'}
                        >
                            <Copy size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 text-center flex-1 overflow-y-auto -mt-6 relative z-10 bg-white rounded-t-3xl">
                    <div className="mb-2">
                        {isHighScoring && <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">{t('chefsChoice', language)}</span>}
                        {isLowScoring && <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wide border border-red-200">{t('kitchenDisaster', language)}</span>}
                        {isHistoryView && <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full uppercase tracking-wide border border-stone-200 ml-2">{t('archived', language)}</span>}
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-1">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-2xl font-display font-bold text-stone-800 text-center bg-stone-100 rounded-lg px-2 py-1 border-2 border-amber-400 focus:outline-none focus:border-amber-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && editedName.trim()) {
                                            onUpdateDish?.(result, { customName: editedName.trim() });
                                            setIsEditingName(false);
                                        } else if (e.key === 'Escape') {
                                            setIsEditingName(false);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (editedName.trim()) {
                                            onUpdateDish?.(result, { customName: editedName.trim() });
                                            setIsEditingName(false);
                                        }
                                    }}
                                    className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-display font-bold text-stone-800 leading-tight">
                                    {displayDishName}
                                </h2>
                                <button
                                    onClick={() => {
                                        setEditedName(displayDishName);
                                        setIsEditingName(true);
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-amber-500 transition-colors"
                                    title={language === 'zh' ? '编辑名称' : 'Edit Name'}
                                >
                                    <Pencil size={16} />
                                </button>
                            </>
                        )}
                    </div>

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

                    {/* Chef Comment with Persona Display */}
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col gap-2 relative">
                        <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 rounded-full border border-amber-100 shadow-sm flex items-center gap-1.5">
                            <span className="text-base">{JUDGE_PERSONAS[result.judgePersonaId as keyof typeof JUDGE_PERSONAS]?.emoji || '👨‍🍳'}</span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                {JUDGE_PERSONAS[result.judgePersonaId as keyof typeof JUDGE_PERSONAS]?.name[language] || (language === 'zh' ? '主厨点评' : "CHEF'S VERDICT")}
                            </span>
                        </div>
                        <p className="text-sm font-serif italic text-amber-900/80 leading-relaxed pt-2">
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