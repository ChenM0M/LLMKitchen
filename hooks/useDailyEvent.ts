
import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';

export type DailyEventType = 'NONE' | 'INFLATION' | 'BUSTLING' | 'RAINY' | 'CRITIC' | 'PROMO';

export interface DailyEvent {
    type: DailyEventType;
    nameKey: string;
    descriptionKey: string;
    priceMultiplier: number;
    customerSpawnRateMultiplier: number;
    patienceMultiplier: number;
    vipChanceMultiplier: number;
}

const EVENTS: Record<DailyEventType, DailyEvent> = {
    NONE: { type: 'NONE', nameKey: 'dailyEvent', descriptionKey: '', priceMultiplier: 1, customerSpawnRateMultiplier: 1, patienceMultiplier: 1, vipChanceMultiplier: 1 },
    INFLATION: { type: 'INFLATION', nameKey: 'dailyEvent', descriptionKey: 'event_inflation', priceMultiplier: 1.5, customerSpawnRateMultiplier: 1, patienceMultiplier: 1, vipChanceMultiplier: 1 },
    BUSTLING: { type: 'BUSTLING', nameKey: 'dailyEvent', descriptionKey: 'event_bustling', priceMultiplier: 1, customerSpawnRateMultiplier: 1.5, patienceMultiplier: 0.8, vipChanceMultiplier: 1 },
    RAINY: { type: 'RAINY', nameKey: 'dailyEvent', descriptionKey: 'event_rainy', priceMultiplier: 1, customerSpawnRateMultiplier: 0.7, patienceMultiplier: 1.3, vipChanceMultiplier: 1 },
    CRITIC: { type: 'CRITIC', nameKey: 'dailyEvent', descriptionKey: 'event_critic', priceMultiplier: 1, customerSpawnRateMultiplier: 1, patienceMultiplier: 1, vipChanceMultiplier: 3 },
    PROMO: { type: 'PROMO', nameKey: 'dailyEvent', descriptionKey: 'event_promo', priceMultiplier: 0.7, customerSpawnRateMultiplier: 1.2, patienceMultiplier: 1, vipChanceMultiplier: 1 },
};

export const useDailyEvent = (day: number) => {
    const [currentEvent, setCurrentEvent] = useState<DailyEvent>(EVENTS.NONE);
    const [showEventModal, setShowEventModal] = useState(false);

    // Roll for event at start of day
    useEffect(() => {
        if (day > 1) { // No events on Day 1
            const roll = Math.random();
            let newEvent = EVENTS.NONE;

            if (roll < 0.15) newEvent = EVENTS.INFLATION;
            else if (roll < 0.3) newEvent = EVENTS.BUSTLING;
            else if (roll < 0.45) newEvent = EVENTS.RAINY;
            else if (roll < 0.55) newEvent = EVENTS.CRITIC; // 10% chance
            else if (roll < 0.7) newEvent = EVENTS.PROMO;

            setCurrentEvent(newEvent);
            if (newEvent.type !== 'NONE') {
                setShowEventModal(true);
            }
        } else {
            setCurrentEvent(EVENTS.NONE);
        }
    }, [day]);

    const closeEventModal = useCallback(() => setShowEventModal(false), []);

    return {
        currentEvent,
        showEventModal,
        closeEventModal
    };
};
