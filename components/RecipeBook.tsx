

import React from 'react';
import { DishResult, Language } from '../types';
import { X, Calendar } from 'lucide-react';
import { t } from '../translations';

interface RecipeBookProps {
    isOpen: boolean;
    onClose: () => void;
    history: DishResult[];
    savedRecipes: DishResult[];
    onToggleSave: (dish: DishResult) => void;
    onSelectDish: (dish: DishResult) => void;
    language: Language;
    onDeleteRecipe?: (dish: DishResult) => void;
    onClearAll?: () => void;
    onSort?: (by: 'date' | 'score') => void;
}

export const RecipeBook: React.FC<RecipeBookProps> = ({ isOpen, onClose, history, savedRecipes = [], onToggleSave, onSelectDish, language, onDeleteRecipe, onClearAll, onSort }) => {
    const [activeTab, setActiveTab] = React.useState<'history' | 'saved'>('saved');
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);

    if (!isOpen) return null;

    const displayList = activeTab === 'saved' ? savedRecipes : history;

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] relative z-10 overflow-hidden flex flex-col animate-slide-up border-4 border-stone-100">

                {/* Header */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                            <span className="text-2xl">📖</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-stone-800 leading-none">{t('myCookbook', language)}</h2>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                                {history.length} {t('recorded', language)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 flex flex-col">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 bg-stone-200/50 p-1 rounded-xl shrink-0">
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            ❤️ {t('favorites', language)} ({savedRecipes.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            📜 {t('history', language)}
                        </button>
                    </div>

                    {/* 管理控制栏 */}
                    {activeTab === 'saved' && savedRecipes.length > 0 && (
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex gap-2">
                                {onSort && (
                                    <>
                                        <button
                                            onClick={() => onSort('score')}
                                            className="text-xs px-3 py-1.5 bg-white rounded-lg text-stone-600 hover:bg-stone-100 transition-colors border border-stone-200 flex items-center gap-1"
                                        >
                                            📊 {language === 'zh' ? '按评分' : 'By Score'}
                                        </button>
                                    </>
                                )}
                            </div>
                            {onClearAll && (
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    className="text-xs px-3 py-1.5 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                                >
                                    🗑️ {language === 'zh' ? '清空全部' : 'Clear All'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* 清空确认对话框 */}
                    {showClearConfirm && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                            <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 text-center shadow-xl">
                                <div className="text-4xl mb-4">⚠️</div>
                                <h3 className="font-bold text-lg text-stone-800 mb-2">
                                    {language === 'zh' ? '确认清空？' : 'Clear all recipes?'}
                                </h3>
                                <p className="text-sm text-stone-500 mb-4">
                                    {language === 'zh' ? '此操作无法撤销' : 'This cannot be undone'}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowClearConfirm(false)}
                                        className="flex-1 py-2 px-4 bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
                                    >
                                        {language === 'zh' ? '取消' : 'Cancel'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClearAll?.();
                                            setShowClearConfirm(false);
                                        }}
                                        className="flex-1 py-2 px-4 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                                    >
                                        {language === 'zh' ? '确认清空' : 'Clear'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {displayList.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-center min-h-[200px]">
                            <div className="text-6xl mb-6 opacity-30 animate-float">{activeTab === 'saved' ? '❤️' : '🍳'}</div>
                            <p className="font-display font-bold text-xl text-stone-500">
                                {activeTab === 'saved' ? (language === 'zh' ? '还没有收藏食谱' : 'No saved recipes yet') : t('cookbookEmpty', language)}
                            </p>
                            <p className="text-sm mt-2 max-w-xs mx-auto">
                                {activeTab === 'saved' ? (language === 'zh' ? '在烹饪结果页点击爱心收藏！' : 'Click the heart icon on result page to save!') : t('startCookingMsg', language)}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                            {displayList.map((dish, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        onSelectDish(dish);
                                        onClose();
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelectDish(dish); onClose(); } }}
                                    className="bg-white p-3 rounded-2xl border-2 border-stone-100 shadow-sm hover:shadow-lg hover:border-chef-300 transition-all flex items-start gap-4 text-left group hover:-translate-y-1 relative cursor-pointer"
                                >
                                    {/* Saved Indicator */}
                                    {activeTab === 'history' && savedRecipes.some(r => r.dishName === dish.dishName && r.description === dish.description) && (
                                        <div className="absolute top-2 right-2 z-10 text-[10px]">❤️</div>
                                    )}

                                    {/* Delete Button for Saved Recipes */}
                                    {activeTab === 'saved' && onDeleteRecipe && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteRecipe(dish);
                                            }}
                                            className="absolute -top-2 -right-2 z-20 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-md border-2 border-white"
                                            title={language === 'zh' ? '删除' : 'Delete'}
                                        >
                                            <X size={12} />
                                        </button>
                                    )}

                                    {/* Image/Emoji */}
                                    <div className="w-20 h-20 rounded-xl bg-stone-100 flex-shrink-0 overflow-hidden relative border border-stone-100 shadow-inner group-hover:shadow-md transition-all">
                                        {dish.imageUrl ? (
                                            <img
                                                src={dish.imageUrl}
                                                alt={dish.dishName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    // 图片加载失败时隐藏并显示 emoji
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform ${dish.imageUrl ? 'hidden' : ''}`}>
                                            {dish.emoji}
                                        </div>
                                        {/* Score Badge */}
                                        <div className={`absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-white/50 backdrop-blur-sm z-10
                                    ${dish.score >= 80 ? 'bg-green-500 text-white' : dish.score <= 30 ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-600'}
                                `}>
                                            {dish.score}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 py-1">
                                        <h3 className="font-display font-bold text-stone-800 truncate leading-tight mb-1 group-hover:text-chef-600 transition-colors text-lg">
                                            {dish.customName || dish.dishName}
                                        </h3>

                                        {dish.customerName ? (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-sm">{dish.customerEmoji}</span>
                                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wide truncate">{dish.customerName}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide bg-stone-100 px-2 py-0.5 rounded-full">{t('sandboxMode', language)}</span>
                                            </div>
                                        )}

                                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                            {dish.description}
                                        </p>

                                        {/* Ingredients List */}
                                        {dish.ingredients && dish.ingredients.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                                                {dish.ingredients.map((ing, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] px-1.5 py-0.5 bg-stone-50 rounded text-stone-500 border border-stone-100 flex items-center gap-1"
                                                        title={`${ing.name} ${ing.marinade ? `(Marinated: ${ing.marinade})` : ''}`}
                                                    >
                                                        <span>{ing.emoji}</span>
                                                        <span className="truncate max-w-[120px] hidden sm:inline flex items-center gap-1">
                                                            {ing.status && <span className="bg-stone-200 px-1 rounded-[2px] text-[8px] uppercase tracking-wider text-stone-600 font-bold">{getStatusLabel(ing.status, language)}</span>}
                                                            {ing.name}
                                                            {ing.marinade && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full ml-0.5" title="Marinated"></span>}
                                                        </span>
                                                        {/* Mobile minimal view */}
                                                        <span className="sm:hidden">
                                                            {ing.status && <span className="text-[8px] bg-stone-200 px-0.5 rounded mr-0.5 font-bold">{getStatusLabel(ing.status, language).charAt(0)}</span>}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};