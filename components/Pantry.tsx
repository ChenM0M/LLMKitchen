import React, { useState, useMemo } from 'react';
import { INGREDIENTS, SEASONINGS } from '../constants';
import { Ingredient, Language, GameMode, Theme } from '../types';
import {
  Plus, ChevronDown, ChevronRight, Apple, Beef, Carrot, Wheat, Milk, Cookie,
  Spline, Flame, Nut, Droplets, Beer, Martini, Citrus, Search, Star, Clock, X
} from 'lucide-react';
import { t } from '../translations';
import { useIngredientPreferences, useIngredientSearch } from '../hooks/useIngredientPreferences';

interface PantryProps {
  onSpawnItem: (ingredient: Ingredient) => void;
  language: Language;
  gameMode: GameMode;
  money: number;
  theme: Theme;
}

interface CategoryGroupProps {
  title: string;
  icon: React.ReactNode;
  items: Ingredient[];
  isOpen: boolean;
  onToggle: () => void;
  onSpawnItem: (ingredient: Ingredient) => void;
  language: Language;
  gameMode: GameMode;
  money: number;
  theme: Theme;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  title,
  icon,
  items,
  isOpen,
  onToggle,
  onSpawnItem,
  language,
  gameMode,
  money,
  theme,
  favorites,
  onToggleFavorite
}) => {
  if (items.length === 0) return null;

  const isJapanese = theme === 'japanese';

  return (
    <div className={`rounded-xl border-2 shadow-inner overflow-hidden transition-all duration-300
        ${isJapanese ? 'bg-[#f0ece0]/80 border-[#8c8468] rounded-md' : 'bg-[#f3e6d3]/80 border-[#d4c09d] rounded-xl'}
    `}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-2 sm:p-3 transition-colors border-b
            ${isJapanese
            ? 'bg-[#e2dccc] hover:bg-[#d4cebd] border-[#8c8468]/50'
            : 'bg-[#eaddc5] hover:bg-[#e4d3b6] border-[#d4c09d]/50'}
        `}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`${isJapanese ? 'text-jp-800' : 'text-[#8c6b4a]'} w-4 h-4 sm:w-5 sm:h-5`}>{icon}</span>
          <span className={`font-black uppercase tracking-wider text-[10px] sm:text-xs ${isJapanese ? 'text-jp-800' : 'text-[#8c6b4a] font-display'}`}>{title}</span>
          <span className={`text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold ${isJapanese ? 'bg-jp-600' : 'bg-[#d4c09d]'}`}>{items.length}</span>
        </div>
        <div className={`${isJapanese ? 'text-jp-800' : 'text-[#8c6b4a]'}`}>
          {isOpen ? <ChevronDown size={16} className="sm:w-5 sm:h-5" /> : <ChevronRight size={16} className="sm:w-5 sm:h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="pantry-grid p-1.5 sm:p-2 md:p-3 grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-3 gap-1.5 xs:gap-2 sm:gap-2.5 animate-slide-up">
          {items.map((item) => (
            <IngredientButton
              key={item.id}
              item={item}
              language={language}
              gameMode={gameMode}
              money={money}
              theme={theme}
              onSpawn={onSpawnItem}
              isFavorite={favorites?.has(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 提取食材按钮为独立组件
interface IngredientButtonProps {
  item: Ingredient;
  language: Language;
  gameMode: GameMode;
  money: number;
  theme: Theme;
  onSpawn: (item: Ingredient) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  showFavoriteButton?: boolean;
}

const IngredientButton: React.FC<IngredientButtonProps> = ({
  item,
  language,
  gameMode,
  money,
  theme,
  onSpawn,
  isFavorite,
  onToggleFavorite,
  showFavoriteButton = true
}) => {
  const isJapanese = theme === 'japanese';
  const displayName = language === 'zh' ? item.nameZh || item.name : item.name;
  const canAfford = gameMode !== 'CHALLENGE' || money >= item.price;

  return (
    <button
      onClick={() => canAfford && onSpawn(item)}
      disabled={!canAfford}
      title={`${displayName} ${gameMode === 'CHALLENGE' ? `($${item.price})` : ''}`}
      className={`
        pantry-item relative group flex flex-col items-center justify-center p-1 xs:p-1.5 sm:p-2 pb-1.5 xs:pb-2 sm:pb-3 rounded-md sm:rounded-lg transition-all duration-200
        border
        ${canAfford
          ? `bg-white cursor-pointer shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-xl active:scale-95 active:shadow-inner ${isJapanese ? 'border-stone-200 hover:border-jp-indigo' : 'border-stone-100 hover:border-chef-200'}`
          : 'bg-stone-200 opacity-60 cursor-not-allowed grayscale border-stone-200'
        }
      `}
    >
      {/* Favorite star - use div instead of button to avoid nesting */}
      {showFavoriteButton && onToggleFavorite && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleFavorite(item.id);
          }}
          className={`absolute top-0.5 left-0.5 p-0.5 rounded-full transition-all z-10 cursor-pointer ${isFavorite
            ? 'text-yellow-500 opacity-100'
            : 'text-stone-300 opacity-0 group-hover:opacity-100 hover:text-yellow-400'
            }`}
        >
          <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
        </div>
      )}

      <div className="pantry-item-emoji text-xl xs:text-2xl sm:text-3xl mb-0.5 sm:mb-1 drop-shadow-sm transform transition-transform group-hover:scale-110">
        {item.emoji}
      </div>
      <span className={`text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-stone-600 truncate w-full text-center px-0.5 sm:px-1 tracking-tight leading-tight ${isJapanese ? '' : 'font-display'}`}>
        {displayName}
      </span>

      {gameMode === 'CHALLENGE' && (
        <div className={`
              absolute top-1 right-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm
              ${canAfford ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          `}>
          ${item.price}
        </div>
      )}

      {canAfford && (
        <div className={`absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-full p-0.5 w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center shadow-sm ${isJapanese ? 'bg-jp-indigo' : 'bg-chef-500'}`}>
          <Plus size={8} strokeWidth={4} />
        </div>
      )}
    </button>
  );
};

export const Pantry: React.FC<PantryProps> = ({
  onSpawnItem,
  language,
  gameMode,
  money,
  theme
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    favorites: true,
    recent: false,
    protein: true,
    vegetable: false,
    starch: false,
    fruit: false,
    nuts: false,
    dairy: false,
    beverage: false,
    alcohol: false,
    basic_spice: true,
    sauce_oil: false,
    aromatic: false,
    baking: false,
    garnish: false
  });

  const allIngredients = useMemo(() => [...INGREDIENTS, ...SEASONINGS], []);
  const { favorites, recentlyUsed, toggleFavorite, addToRecent, isFavorite } = useIngredientPreferences();
  const { searchQuery, setSearchQuery, filteredIngredients, clearSearch, isSearching } = useIngredientSearch(allIngredients);

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle spawn with tracking
  const handleSpawn = (item: Ingredient) => {
    addToRecent(item.id);
    onSpawnItem(item);
  };

  // Get favorite items
  const favoriteItems = useMemo(() =>
    allIngredients.filter(i => favorites.has(i.id)),
    [allIngredients, favorites]
  );

  // Get recent items
  const recentItems = useMemo(() =>
    recentlyUsed
      .map(id => allIngredients.find(i => i.id === id))
      .filter((i): i is Ingredient => i !== undefined),
    [allIngredients, recentlyUsed]
  );

  const getFreshGroups = () => ({
    protein: INGREDIENTS.filter(i => i.category === 'protein'),
    vegetable: INGREDIENTS.filter(i => i.category === 'vegetable'),
    starch: INGREDIENTS.filter(i => i.category === 'starch'),
    fruit: INGREDIENTS.filter(i => i.category === 'fruit'),
    nuts: INGREDIENTS.filter(i => i.category === 'nuts'),
    dairy: INGREDIENTS.filter(i => i.category === 'dairy'),
    beverage: INGREDIENTS.filter(i => i.category === 'beverage'),
    alcohol: INGREDIENTS.filter(i => i.category === 'alcohol'),
  });

  const getSeasoningGroups = () => {
    const basic = ['salt', 'pepper', 'sugar', 'brown_sugar', 'honey', 'msg', 'powdered_sugar'];
    const sauces = ['soysauce', 'vinegar', 'cooking_wine', 'oliveoil', 'sesame_oil', 'truffle_oil', 'chili', 'butter', 'wasabi'];
    const aromatics = ['garlic', 'ginger', 'fresh_chili', 'herb', 'five_spice', 'curry_powder', 'cumin', 'saffron', 'gold_leaf'];
    const baking = ['vanilla', 'cinnamon', 'cocoa', 'matcha', 'yeast', 'baking_powder', 'baking_soda'];
    const garnish = ['ice', 'mint', 'lemon', 'lime', 'olive'];

    return {
      basic_spice: SEASONINGS.filter(i => basic.includes(i.id)),
      sauce_oil: SEASONINGS.filter(i => sauces.includes(i.id)),
      aromatic: SEASONINGS.filter(i => aromatics.includes(i.id)),
      baking: SEASONINGS.filter(i => baking.includes(i.id)),
      garnish: SEASONINGS.filter(i => garnish.includes(i.id)),
    };
  };

  const fresh = getFreshGroups();
  const seasoning = getSeasoningGroups();
  const isJapanese = theme === 'japanese';
  const isZh = language === 'zh';

  return (
    <div className={`p-2 h-full overflow-y-auto custom-scrollbar border-r-8 shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] relative pb-[calc(0.5rem+env(safe-area-inset-bottom))]
         ${isJapanese ? 'bg-[#dcd3b2] border-[#8c8468]' : 'bg-[#e8d5b5] border-[#c7a677]'}
    `}>
      <div className={`absolute inset-0 opacity-50 pointer-events-none z-0 ${isJapanese ? 'bg-tatami opacity-30' : 'bg-wood'}`}></div>

      <div className="relative z-10 space-y-2 p-1">

        {/* Search Bar */}
        <div className="relative mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isZh ? '搜索食材...' : 'Search ingredients...'}
              className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border-2 transition-all
                ${isJapanese
                  ? 'bg-white/90 border-stone-300 focus:border-jp-indigo'
                  : 'bg-white/90 border-[#d4c09d] focus:border-amber-400'
                } focus:outline-none focus:ring-2 focus:ring-amber-200`}
            />
            {isSearching && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className={`rounded-xl border-2 p-3 mb-3 ${isJapanese ? 'bg-white/80 border-jp-indigo' : 'bg-white/80 border-amber-300'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Search size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-stone-600">
                {isZh ? `找到 ${filteredIngredients.length} 个结果` : `${filteredIngredients.length} results`}
              </span>
            </div>
            {filteredIngredients.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-2">
                {filteredIngredients.slice(0, 12).map(item => (
                  <IngredientButton
                    key={item.id}
                    item={item}
                    language={language}
                    gameMode={gameMode}
                    money={money}
                    theme={theme}
                    onSpawn={handleSpawn}
                    isFavorite={isFavorite(item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-2">
                {isZh ? '没有找到匹配的食材' : 'No matching ingredients'}
              </p>
            )}
          </div>
        )}

        {/* Favorites Section */}
        {favoriteItems.length > 0 && !isSearching && (
          <div className={`rounded-xl border-2 overflow-hidden mb-2 ${isJapanese ? 'bg-yellow-50/80 border-yellow-300' : 'bg-yellow-50/80 border-yellow-200'}`}>
            <button
              onClick={() => toggle('favorites')}
              className="w-full flex items-center justify-between p-2 bg-yellow-100/80 hover:bg-yellow-100 transition-colors border-b border-yellow-200"
            >
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-500" fill="currentColor" />
                <span className="text-xs font-bold text-yellow-700">{isZh ? '收藏' : 'Favorites'}</span>
                <span className="bg-yellow-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{favoriteItems.length}</span>
              </div>
              {expanded.favorites ? <ChevronDown size={14} className="text-yellow-600" /> : <ChevronRight size={14} className="text-yellow-600" />}
            </button>
            {expanded.favorites && (
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-2 p-2">
                {favoriteItems.map(item => (
                  <IngredientButton
                    key={item.id}
                    item={item}
                    language={language}
                    gameMode={gameMode}
                    money={money}
                    theme={theme}
                    onSpawn={handleSpawn}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recently Used Section */}
        {recentItems.length > 0 && !isSearching && (
          <div className={`rounded-xl border-2 overflow-hidden mb-2 ${isJapanese ? 'bg-blue-50/80 border-blue-200' : 'bg-blue-50/80 border-blue-200'}`}>
            <button
              onClick={() => toggle('recent')}
              className="w-full flex items-center justify-between p-2 bg-blue-100/80 hover:bg-blue-100 transition-colors border-b border-blue-200"
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-700">{isZh ? '最近使用' : 'Recent'}</span>
                <span className="bg-blue-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{recentItems.length}</span>
              </div>
              {expanded.recent ? <ChevronDown size={14} className="text-blue-600" /> : <ChevronRight size={14} className="text-blue-600" />}
            </button>
            {expanded.recent && (
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-2 p-2">
                {recentItems.map(item => (
                  <IngredientButton
                    key={item.id}
                    item={item}
                    language={language}
                    gameMode={gameMode}
                    money={money}
                    theme={theme}
                    onSpawn={handleSpawn}
                    isFavorite={isFavorite(item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fresh Ingredients Header */}
        {!isSearching && (
          <>
            <div className="flex items-center gap-2 mb-2 mt-2 px-2 opacity-80">
              <div className={`h-px flex-1 ${isJapanese ? 'bg-jp-800' : 'bg-[#8c6b4a]'}`}></div>
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isJapanese ? 'text-jp-800' : 'text-[#8c6b4a]'}`}>{t('freshIngredients', language)}</span>
              <div className={`h-px flex-1 ${isJapanese ? 'bg-jp-800' : 'bg-[#8c6b4a]'}`}></div>
            </div>

            <CategoryGroup title={t('cat_alcohol', language)} icon={<Martini size={16} />} items={fresh.alcohol} isOpen={expanded.alcohol} onToggle={() => toggle('alcohol')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_beverage', language)} icon={<Beer size={16} />} items={fresh.beverage} isOpen={expanded.beverage} onToggle={() => toggle('beverage')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_protein', language)} icon={<Beef size={16} />} items={fresh.protein} isOpen={expanded.protein} onToggle={() => toggle('protein')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_vegetable', language)} icon={<Carrot size={16} />} items={fresh.vegetable} isOpen={expanded.vegetable} onToggle={() => toggle('vegetable')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_starch', language)} icon={<Wheat size={16} />} items={fresh.starch} isOpen={expanded.starch} onToggle={() => toggle('starch')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_fruit', language)} icon={<Apple size={16} />} items={fresh.fruit} isOpen={expanded.fruit} onToggle={() => toggle('fruit')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_nuts', language)} icon={<Nut size={16} />} items={fresh.nuts} isOpen={expanded.nuts} onToggle={() => toggle('nuts')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_dairy', language)} icon={<Milk size={16} />} items={fresh.dairy} isOpen={expanded.dairy} onToggle={() => toggle('dairy')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />

            {/* Seasonings Header */}
            <div className="flex items-center gap-2 mb-2 mt-6 px-2 opacity-80">
              <div className={`h-px flex-1 ${isJapanese ? 'bg-jp-800' : 'bg-[#8c6b4a]'}`}></div>
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isJapanese ? 'text-jp-800' : 'text-[#8c6b4a]'}`}>{t('seasoningRack', language)}</span>
              <div className={`h-px flex-1 ${isJapanese ? 'bg-jp-800' : 'bg-[#8c6b4a]'}`}></div>
            </div>

            <CategoryGroup title={t('cat_garnish', language)} icon={<Citrus size={16} />} items={seasoning.garnish} isOpen={expanded.garnish} onToggle={() => toggle('garnish')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_basic_spice', language)} icon={<Spline size={16} />} items={seasoning.basic_spice} isOpen={expanded.basic_spice} onToggle={() => toggle('basic_spice')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_sauce_oil', language)} icon={<Droplets size={16} />} items={seasoning.sauce_oil} isOpen={expanded.sauce_oil} onToggle={() => toggle('sauce_oil')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_aromatic', language)} icon={<Flame size={16} />} items={seasoning.aromatic} isOpen={expanded.aromatic} onToggle={() => toggle('aromatic')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />
            <CategoryGroup title={t('cat_baking', language)} icon={<Cookie size={16} />} items={seasoning.baking} isOpen={expanded.baking} onToggle={() => toggle('baking')} onSpawnItem={handleSpawn} language={language} gameMode={gameMode} money={money} theme={theme} favorites={favorites} onToggleFavorite={toggleFavorite} />

            <div className="h-12"></div>
          </>
        )}
      </div>
    </div>
  );
};
