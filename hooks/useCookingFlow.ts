import { useState, useEffect } from 'react';
import { DishResult, AnyCookingMethod, KitchenItem, Customer, CookingPrecision, PrepMethod, MarinateMethod, MixMethod, HeatMethod, Language, mergeItems, QTERating, JudgePersona } from '../types';
import { cookDish } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { toast } from 'react-hot-toast';
import { urlToBase64 } from '../utils/imageUtils';
import { saveImage, getImage, generateImageId } from '../services/imageStorage';

export const useCookingFlow = (language: Language) => {
    // Core State
    const [isCooking, setIsCooking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAnimationMethod, setActiveAnimationMethod] = useState<AnyCookingMethod | null>(null);
    const [lastResult, setLastResult] = useState<DishResult | null>(null);

    // History - 初始化时从 localStorage 读取，然后从 IndexedDB 恢复图片
    const [history, setHistory] = useState<DishResult[]>([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    // 初始化加载 history 并恢复图片
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const savedHistory = localStorage.getItem('ai-pocket-kitchen-history');
                if (savedHistory) {
                    const parsed: DishResult[] = JSON.parse(savedHistory);
                    // 从 IndexedDB 恢复图片
                    const restored = await Promise.all(
                        parsed.map(async (dish) => {
                            if (dish.imageId) {
                                const imageUrl = await getImage(dish.imageId);
                                return { ...dish, imageUrl: imageUrl || undefined };
                            }
                            return dish;
                        })
                    );
                    setHistory(restored);
                }
            } catch (e) {
                console.error('Failed to load history:', e);
            } finally {
                setHistoryLoaded(true);
            }
        };
        loadHistory();
    }, []);

    // Save History - 只在历史真正改变时保存（等待初始化完成后再保存）
    // 图片存储在 IndexedDB 中 (via imageId)，不存储 imageUrl 到 localStorage
    useEffect(() => {
        if (!historyLoaded) return; // 等待初始化完成
        if (history.length > 0 || localStorage.getItem('ai-pocket-kitchen-history') === null) {
            try {
                // Strip imageUrl from history - images are in IndexedDB via imageId
                const historyToSave = history.slice(0, 30).map(dish => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { imageUrl, ...rest } = dish;
                    return rest; // Keep imageId, remove imageUrl
                });
                localStorage.setItem('ai-pocket-kitchen-history', JSON.stringify(historyToSave));
            } catch (e) {
                console.error('Failed to save history:', e);
            }
        }
    }, [history, historyLoaded]);

    // Cookbook State - 初始化时从 localStorage 读取，然后从 IndexedDB 恢复图片
    const [savedRecipes, setSavedRecipes] = useState<DishResult[]>([]);
    const [recipesLoaded, setRecipesLoaded] = useState(false);

    // 初始化加载 savedRecipes 并恢复图片
    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const saved = localStorage.getItem('ai-pocket-kitchen-cookbook');
                if (saved) {
                    const parsed: DishResult[] = JSON.parse(saved);
                    // 从 IndexedDB 恢复图片
                    const restored = await Promise.all(
                        parsed.map(async (dish) => {
                            if (dish.imageId) {
                                const imageUrl = await getImage(dish.imageId);
                                return { ...dish, imageUrl: imageUrl || undefined };
                            }
                            return dish;
                        })
                    );
                    setSavedRecipes(restored);
                }
            } catch (e) {
                console.error('Failed to load recipes:', e);
            } finally {
                setRecipesLoaded(true);
            }
        };
        loadRecipes();
    }, []);

    // Save Cookbook - 只在 savedRecipes 真正改变时保存（等待初始化完成后再保存）
    // 图片存储在 IndexedDB 中 (via imageId)
    useEffect(() => {
        if (!recipesLoaded) return; // 等待初始化完成
        if (savedRecipes.length > 0 || localStorage.getItem('ai-pocket-kitchen-cookbook') === null) {
            try {
                // Strip imageUrl - images are in IndexedDB via imageId
                const recipesToSave = savedRecipes.map(dish => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { imageUrl, ...rest } = dish;
                    return rest;
                });
                localStorage.setItem('ai-pocket-kitchen-cookbook', JSON.stringify(recipesToSave));
            } catch (e) {
                console.error('Failed to save cookbook:', e);
            }
        }
    }, [savedRecipes, recipesLoaded]);

    const toggleSaveRecipe = async (dish: DishResult) => {
        const exists = savedRecipes.find(d => d.dishName === dish.dishName && d.description === dish.description);
        if (exists) {
            setSavedRecipes(prev => prev.filter(d => d !== exists));
        } else {
            let dishToSave = { ...dish };
            if (dish.imageUrl && !dish.imageUrl.startsWith('data:')) {
                try {
                    const base64 = await urlToBase64(dish.imageUrl);
                    dishToSave.imageUrl = base64;
                } catch (e) {
                    console.error('Failed to cache image', e);
                }
            }
            setSavedRecipes(prev => [...prev, dishToSave]);
        }
    };

    // Prep Action - processes items in prepItems array
    const performPrep = async (
        items: KitchenItem[],
        method: PrepMethod,
        updateCallback: (newItems: KitchenItem[]) => void,
        mode: 'MERGE' | 'SEPARATE' = 'SEPARATE'
    ) => {
        if (isCooking || items.length === 0) return;

        setIsCooking(true);
        setActiveAnimationMethod(method);
        audioService.startCookingSound(method);

        await new Promise(resolve => setTimeout(resolve, 2000));

        audioService.stopCookingSound();
        setIsCooking(false);
        setActiveAnimationMethod(null);

        // 确定新状态
        let newStatus: any = 'raw';
        if (method === PrepMethod.CHOP) newStatus = 'chopped';
        if (method === PrepMethod.SLICE) newStatus = 'sliced';
        if (method === PrepMethod.JULIENNE) newStatus = 'julienned';
        if (method === PrepMethod.MASH) newStatus = 'mashed';
        if (method === PrepMethod.GRIND) newStatus = 'ground';
        if (method === PrepMethod.BLEND) newStatus = 'blended';
        if (method === PrepMethod.AIR_DRY) newStatus = 'dried';
        if (method === PrepMethod.DEHYDRATE) newStatus = 'dehydrated';

        if (mode === 'MERGE' && items.length > 0) {
            try {
                const mergedItem = mergeItems(items, method);
                mergedItem.status = newStatus;
                mergedItem.statuses = [...(mergedItem.statuses || []), newStatus];
                mergedItem.processHistory = [...(mergedItem.processHistory || []), { method, timestamp: Date.now() }];
                updateCallback([mergedItem]);
            } catch (e) {
                console.error("Merge failed", e);
                const updatedItems = items.map(item => ({
                    ...item,
                    status: newStatus,
                    statuses: [...(item.statuses || []), newStatus],
                    processHistory: [...(item.processHistory || []), { method, timestamp: Date.now() }]
                } as KitchenItem));
                updateCallback(updatedItems);
            }
        } else {
            // 分开处理每个食材，更新 status、statuses 和 processHistory
            const updatedItems = items.map(item => ({
                ...item,
                status: newStatus,
                statuses: [...(item.statuses || []), newStatus],
                processHistory: [...(item.processHistory || []), { method, timestamp: Date.now() }]
            } as KitchenItem));
            updateCallback(updatedItems);
        }
    };

    // Marinate Action
    const performMarinate = async (
        items: KitchenItem[],
        updateCallback: (newItems: KitchenItem[]) => void
    ) => {
        if (isCooking || items.length === 0) return;

        setIsCooking(true);
        setActiveAnimationMethod(MarinateMethod.MARINATE);
        audioService.startCookingSound(MarinateMethod.MARINATE);

        await new Promise(resolve => setTimeout(resolve, 2000));

        audioService.stopCookingSound();
        setIsCooking(false);
        setActiveAnimationMethod(null);

        // Separate seasonings and base ingredients
        const marinadeLiquids = ['milk', 'cream', 'oil', 'butter', 'soysauce', 'vinegar', 'cola', 'wine', 'water'];
        const spices = items.filter(i => i.category === 'seasoning' || marinadeLiquids.includes(i.id));
        const bases = items.filter(i => !spices.includes(i));
        const spiceNames = spices.map(s => language === 'zh' ? s.nameZh || s.name : s.name);

        // Apply marinade to base items
        if (bases.length > 0) {
            const newStatus = 'marinated';
            const updatedBases = bases.map(item => ({
                ...item,
                status: item.status === 'raw' ? newStatus : item.status,
                statuses: [...(item.statuses || []), newStatus],
                processHistory: [...(item.processHistory || []), { method: MarinateMethod.MARINATE, timestamp: Date.now() }],
                marinadeLabels: [...(item.marinadeLabels || []), ...spiceNames]
            } as KitchenItem));
            updateCallback(updatedBases);
        } else {
            updateCallback(items);
        }
    };

    // Generic Process Action (Cooking/Mixing without submitting)
    // 烹饪/调酒后会将所有食材合并成一个整体
    // qteRating: QTE 小游戏评级，影响最终效果
    const performProcess = async (
        items: KitchenItem[],
        method: AnyCookingMethod,
        updateCallback: (newItems: KitchenItem[]) => void,
        qteRating?: QTERating
    ) => {
        if (isCooking || items.length === 0) return;

        setIsCooking(true);
        setActiveAnimationMethod(method);
        audioService.startCookingSound(method);

        // Wait for animation (根据评级调整时间)
        const animTime = qteRating === 'perfect' ? 1500 : qteRating === 'failed' ? 2500 : 2000;
        await new Promise(resolve => setTimeout(resolve, animTime));

        audioService.stopCookingSound();
        setIsCooking(false);
        setActiveAnimationMethod(null);

        // 确定新状态
        let newStatus: any = 'cooked';
        // Heat Methods
        if (method === HeatMethod.FRY) newStatus = 'fried';
        if (method === HeatMethod.DEEP_FRY) newStatus = 'deep_fried';
        if (method === HeatMethod.STIR_FRY) newStatus = 'stir_fried';
        if (method === HeatMethod.BOIL) newStatus = 'boiled';
        if (method === HeatMethod.STEAM) newStatus = 'steamed';
        if (method === HeatMethod.BRAISE) newStatus = 'braised';
        if (method === HeatMethod.BAKE) newStatus = 'baked';
        if (method === HeatMethod.GRILL) newStatus = 'grilled';
        if (method === HeatMethod.MICROWAVE) newStatus = 'microwaved';
        // Mix Methods
        if (method === MixMethod.SHAKE) newStatus = 'shaken';
        if (method === MixMethod.STIR) newStatus = 'stirred';
        if (method === MixMethod.BUILD) newStatus = 'layered';

        // 如果只有一个食材，只更新状态
        if (items.length === 1) {
            const updatedItem: KitchenItem = {
                ...items[0],
                status: newStatus,
                statuses: [...(items[0].statuses || []), newStatus],
                processHistory: [...(items[0].processHistory || []), { method, timestamp: Date.now(), qteRating }],
                qteRating: qteRating || items[0].qteRating // 保存 QTE 评级
            };
            updateCallback([updatedItem]);
            return;
        }

        // 多个食材时，合并成一个整体
        try {
            const mergedItem = mergeItems(items, method);
            mergedItem.status = newStatus;
            mergedItem.statuses = [...(mergedItem.statuses || []), newStatus];
            mergedItem.processHistory = [...(mergedItem.processHistory || []), { method, timestamp: Date.now(), qteRating }];
            mergedItem.qteRating = qteRating; // 保存 QTE 评级
            updateCallback([mergedItem]);
        } catch (e) {
            console.error("Merge failed", e);
            // 合并失败时，退回到更新每个食材的状态
            const updatedItems = items.map(item => ({
                ...item,
                status: newStatus,
                statuses: [...(item.statuses || []), newStatus],
                processHistory: [...(item.processHistory || []), { method, timestamp: Date.now() }],
                qteRating: qteRating
            } as KitchenItem));
            updateCallback(updatedItems);
        }
    };

    // Start cooking animation (for visual feedback before API call)
    const startCookingAnimation = (method: AnyCookingMethod) => {
        setIsCooking(true);
        setActiveAnimationMethod(method);
        audioService.startCookingSound(method);
    };

    // Perform cook - sends to AI and gets result
    const performCook = async (
        items: KitchenItem[],
        method: AnyCookingMethod | null,
        customer: Customer | null,
        precision: CookingPrecision = 'perfect',
        judgePersona: JudgePersona = 'standard'
    ): Promise<DishResult | null> => {
        if (isSubmitting || items.length === 0) return null;

        setIsSubmitting(true);
        try {
            const result = await cookDish(items, method, customer, language, precision, judgePersona);
            audioService.stopCookingSound();

            // 保存图片到 IndexedDB 以实现持久化
            if (result.imageUrl) {
                const imageId = generateImageId(result.dishName);
                try {
                    await saveImage(imageId, result.imageUrl);
                    result.imageId = imageId; // 记录 imageId 以便后续恢复
                } catch (e) {
                    console.error('Failed to save image to IndexedDB:', e);
                }
            }

            setLastResult(result);
            setHistory(prev => [result, ...prev]);
            return result;
        } catch (e) {
            console.error(e);
            audioService.stopCookingSound();
            toast.error(language === 'zh' ? 'API 请求失败，食材已退回' : 'Cooking failed, items refunded');
            return null;
        } finally {
            setIsSubmitting(false);
            setIsCooking(false);
            setActiveAnimationMethod(null);
        }
    };

    const resetResult = () => {
        setLastResult(null);
    };

    // 食谱管理功能
    const deleteRecipe = (dish: DishResult) => {
        setSavedRecipes(prev => prev.filter(d =>
            !(d.dishName === dish.dishName && d.description === dish.description)
        ));
    };

    const clearAllRecipes = () => {
        setSavedRecipes([]);
    };

    const sortRecipes = (by: 'date' | 'score') => {
        setSavedRecipes(prev => {
            const sorted = [...prev];
            if (by === 'score') {
                sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
            }
            // 'date' 保持默认顺序（新添加的在前面）
            return sorted;
        });
    };

    return {
        // State
        isCooking,
        isSubmitting,
        activeAnimationMethod,
        lastResult,
        setLastResult,
        history,

        // Actions
        performPrep,
        performMarinate,
        performProcess,
        startCookingAnimation,
        performCook,
        resetResult,

        // Cookbook
        savedRecipes,
        toggleSaveRecipe,
        deleteRecipe,
        clearAllRecipes,
        sortRecipes
    };
};