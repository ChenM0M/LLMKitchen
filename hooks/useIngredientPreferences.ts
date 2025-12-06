import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ingredient } from '../types';
import { pinyin } from 'pinyin-pro';

const FAVORITES_KEY = 'cookingGenius_favorites';
const RECENT_KEY = 'cookingGenius_recent';
const MAX_RECENT = 10;

/**
 * Hook for managing ingredient favorites and recently used
 */
export const useIngredientPreferences = () => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem(FAVORITES_KEY);
            if (savedFavorites) {
                setFavorites(new Set(JSON.parse(savedFavorites)));
            }

            const savedRecent = localStorage.getItem(RECENT_KEY);
            if (savedRecent) {
                setRecentlyUsed(JSON.parse(savedRecent));
            }
        } catch (e) {
            console.warn('Failed to load ingredient preferences:', e);
        }
    }, []);

    // Toggle favorite
    const toggleFavorite = useCallback((ingredientId: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(ingredientId)) {
                next.delete(ingredientId);
            } else {
                next.add(ingredientId);
            }
            // Save to localStorage
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
            } catch (e) { }
            return next;
        });
    }, []);

    // Add to recently used
    const addToRecent = useCallback((ingredientId: string) => {
        setRecentlyUsed(prev => {
            // Remove if already exists, then add to front
            const filtered = prev.filter(id => id !== ingredientId);
            const next = [ingredientId, ...filtered].slice(0, MAX_RECENT);
            // Save to localStorage
            try {
                localStorage.setItem(RECENT_KEY, JSON.stringify(next));
            } catch (e) { }
            return next;
        });
    }, []);

    // Check if ingredient is favorite
    const isFavorite = useCallback((ingredientId: string) => {
        return favorites.has(ingredientId);
    }, [favorites]);

    // Clear recent
    const clearRecent = useCallback(() => {
        setRecentlyUsed([]);
        try {
            localStorage.removeItem(RECENT_KEY);
        } catch (e) { }
    }, []);

    return {
        favorites,
        recentlyUsed,
        toggleFavorite,
        addToRecent,
        isFavorite,
        clearRecent,
        favoritesCount: favorites.size,
        recentCount: recentlyUsed.length,
    };
};

/**
 * 获取中文的拼音（全拼+首字母）
 */
const getPinyinVariants = (chinese: string): string[] => {
    if (!chinese) return [];
    try {
        const fullPinyin = pinyin(chinese, { toneType: 'none', type: 'array' }).join('');
        const firstLetters = pinyin(chinese, { pattern: 'first', toneType: 'none', type: 'array' }).join('');
        return [fullPinyin.toLowerCase(), firstLetters.toLowerCase()];
    } catch {
        return [];
    }
};

/**
 * Hook for ingredient search/filter with pinyin support
 */
export const useIngredientSearch = (allIngredients: Ingredient[]) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);

    // 预计算所有食材的拼音索引
    const pinyinIndex = useMemo(() => {
        const index = new Map<string, string[]>();
        allIngredients.forEach(ing => {
            if (ing.nameZh) {
                index.set(ing.id, getPinyinVariants(ing.nameZh));
            }
        });
        return index;
    }, [allIngredients]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredIngredients([]);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const results = allIngredients.filter(ing => {
            // 英文名匹配
            if (ing.name.toLowerCase().includes(query)) return true;
            // 中文名匹配
            if (ing.nameZh?.toLowerCase().includes(query)) return true;
            // ID匹配
            if (ing.id.toLowerCase().includes(query)) return true;
            // 拼音匹配（全拼+首字母）
            const pinyinVariants = pinyinIndex.get(ing.id);
            if (pinyinVariants) {
                return pinyinVariants.some(py => py.includes(query));
            }
            return false;
        });

        setFilteredIngredients(results);
    }, [searchQuery, allIngredients, pinyinIndex]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        filteredIngredients,
        clearSearch,
        isSearching: searchQuery.trim().length > 0,
    };
};

