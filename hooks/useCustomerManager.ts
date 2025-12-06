import { useState, useEffect } from 'react';
import { Customer, GameMode, Language } from '../types';
import { generateCustomer } from '../services/geminiService';
import { CUSTOMERS, SPECIAL_CUSTOMERS } from '../constants';
import { audioService } from '../services/audioService';

const MAX_TIME = 120;

export const useCustomerManager = (
    gameMode: GameMode | null,
    language: Language,
    isCooking: boolean,
    hasLastResult: boolean,
    isPaused: boolean,
    onTimeout: () => void
) => {
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
    const [timeLeft, setTimeLeft] = useState(MAX_TIME);

    const loadNewCustomer = async () => {
        setIsLoadingCustomer(true);
        setTimeLeft(MAX_TIME);

        // 15% Chance for a Special Customer (Anime Characters)
        if (Math.random() < 0.25 && SPECIAL_CUSTOMERS.length > 0) {
            const specialTemplate = SPECIAL_CUSTOMERS[Math.floor(Math.random() * SPECIAL_CUSTOMERS.length)];
            try {
                // Generate dynamic request for this special character
                const customer = await generateCustomer(language, specialTemplate);
                setCurrentCustomer(customer);
            } catch (e) {
                // Fallback to static template if AI fails
                setCurrentCustomer(specialTemplate);
            }
            setIsLoadingCustomer(false);
            return;
        }

        try {
            const customer = await generateCustomer(language);
            setCurrentCustomer(customer);
        } catch (e) {
            const randomCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
            setCurrentCustomer(randomCustomer);
        } finally {
            setIsLoadingCustomer(false);
            setTimeLeft(MAX_TIME);
        }
    };

    // Cleanup when leaving Challenge mode
    useEffect(() => {
        if (gameMode !== 'CHALLENGE') {
            setCurrentCustomer(null);
            setIsLoadingCustomer(false);
            setTimeLeft(MAX_TIME);
        }
    }, [gameMode]);

    // Timer Logic
    useEffect(() => {
        if (gameMode !== 'CHALLENGE' || !currentCustomer || isCooking || hasLastResult || isLoadingCustomer || isPaused) {
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameMode, currentCustomer, isCooking, hasLastResult, isLoadingCustomer, isPaused]);

    // Timeout Handler
    useEffect(() => {
        if (timeLeft === 0 && gameMode === 'CHALLENGE' && currentCustomer && !isCooking && !hasLastResult && !isPaused) {
            audioService.playFailure();
            onTimeout();
            loadNewCustomer();
        }
    }, [timeLeft, gameMode, currentCustomer, isCooking, hasLastResult, isPaused]);

    const serveCustomer = (dish: any) => {
        if (!currentCustomer) return { success: false, basePrice: 0, tip: 0 };

        // Simple logic for now, can be expanded
        const basePrice = currentCustomer.budget;
        const tip = Math.floor(basePrice * 0.2); // 20% tip for now

        setCurrentCustomer(null);
        setIsLoadingCustomer(false);
        setTimeLeft(MAX_TIME);

        return { success: true, basePrice, tip };
    };

    return {
        currentCustomer, setCurrentCustomer,
        isLoadingCustomer,
        timeLeft,
        loadNewCustomer,
        serveCustomer
    };
};
