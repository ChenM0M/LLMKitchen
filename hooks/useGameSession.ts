import { useState, useEffect, useCallback } from 'react';
import { GameMode, Theme, Language } from '../types';
import { audioService } from '../services/audioService';

const DAY_LENGTH = 180; // 3 分钟
const RENT_COST = 80;   // 降低租金

// 存档数据结构
interface SaveData {
    money: number;
    day: number;
    dayTimeLeft: number;
    dailyRevenue: number;
    customersServed: number;
    totalRevenue: number;
    timestamp: number;
}

const SAVE_KEY = 'ai-pocket-kitchen-save';

export const useGameSession = () => {
    const [gameMode, setGameMode] = useState<GameMode | null>(null);
    const [money, setMoney] = useState(200);
    const [day, setDay] = useState(1);
    const [dayTimeLeft, setDayTimeLeft] = useState(DAY_LENGTH);
    const [dailyRevenue, setDailyRevenue] = useState(0);
    const [showDaySummary, setShowDaySummary] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);
    const [customersServed, setCustomersServed] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [hasSave, setHasSave] = useState(false);

    // Settings state
    const [language, setLanguage] = useState<Language>('zh');
    const [theme, setTheme] = useState<Theme>('default');

    // 检查是否有存档
    useEffect(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        setHasSave(!!saved);
    }, []);

    // Initialize Settings
    useEffect(() => {
        const savedTheme = localStorage.getItem('ai-pocket-kitchen-theme');
        if (savedTheme === 'japanese' || savedTheme === 'default') {
            setTheme(savedTheme as Theme);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ai-pocket-kitchen-theme', theme);
    }, [theme]);

    // 自动保存 - 每30秒保存一次进度
    useEffect(() => {
        if (gameMode !== 'CHALLENGE' || showGameOver) return;

        const autoSave = setInterval(() => {
            saveGame();
        }, 30000);

        return () => clearInterval(autoSave);
    }, [gameMode, showGameOver, money, day, dayTimeLeft]);

    // 保存游戏
    const saveGame = useCallback(() => {
        if (gameMode !== 'CHALLENGE') return;

        const saveData: SaveData = {
            money,
            day,
            dayTimeLeft,
            dailyRevenue,
            customersServed,
            totalRevenue,
            timestamp: Date.now()
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        setHasSave(true);
        console.log('[存档] 已保存进度');
    }, [money, day, dayTimeLeft, dailyRevenue, customersServed, totalRevenue, gameMode]);

    // 读取存档
    const loadGame = useCallback(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return false;

        try {
            const data: SaveData = JSON.parse(saved);
            setMoney(data.money);
            setDay(data.day);
            setDayTimeLeft(data.dayTimeLeft);
            setDailyRevenue(data.dailyRevenue);
            setCustomersServed(data.customersServed || 0);
            setTotalRevenue(data.totalRevenue || 0);
            setShowDaySummary(false);
            setShowGameOver(false);
            console.log('[存档] 已读取进度');
            return true;
        } catch {
            return false;
        }
    }, []);

    // 删除存档
    const deleteSave = useCallback(() => {
        localStorage.removeItem(SAVE_KEY);
        setHasSave(false);
    }, []);

    // Reset session when entering Challenge Mode (新游戏)
    const startNewGame = useCallback(() => {
        setMoney(200);
        setDay(1);
        setDayTimeLeft(DAY_LENGTH);
        setDailyRevenue(0);
        setCustomersServed(0);
        setTotalRevenue(0);
        setShowDaySummary(false);
        setShowGameOver(false);
        deleteSave();
    }, [deleteSave]);

    // Day Timer
    useEffect(() => {
        if (gameMode !== 'CHALLENGE' || showDaySummary || showGameOver) return;
        const timer = setInterval(() => {
            setDayTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    audioService.playSuccess();
                    setShowDaySummary(true);
                    saveGame(); // 一天结束时保存
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameMode, showDaySummary, showGameOver, saveGame]);

    const handleTransaction = (amount: number) => {
        setMoney(prev => prev + amount);
        if (amount > 0) {
            setDailyRevenue(prev => prev + amount);
            setTotalRevenue(prev => prev + amount);
            setCustomersServed(prev => prev + 1);
        }
    };

    const startNextDay = () => {
        const newBalance = money - RENT_COST;
        if (newBalance < 0) {
            setShowGameOver(true);
            setShowDaySummary(false);
            deleteSave(); // 游戏结束删除存档
        } else {
            setMoney(newBalance);
            setDay(d => d + 1);
            setDayTimeLeft(DAY_LENGTH);
            setDailyRevenue(0);
            setShowDaySummary(false);
            saveGame(); // 新一天开始时保存
        }
    };

    return {
        gameMode, setGameMode,
        money, setMoney,
        day, dayTimeLeft, dailyRevenue,
        showDaySummary, setShowDaySummary,
        showGameOver, setShowGameOver,
        handleTransaction,
        startNextDay,
        language, setLanguage,
        theme, setTheme,
        RENT_COST, DAY_LENGTH,
        // 存档相关
        hasSave,
        saveGame,
        loadGame,
        deleteSave,
        startNewGame,
        // 统计
        customersServed,
        totalRevenue
    };
};