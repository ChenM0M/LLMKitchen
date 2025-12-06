import { useState } from 'react';
import { KitchenItem, Ingredient } from '../types';
import { audioService } from '../services/audioService';

export const useInventory = () => {
    const [counterItems, setCounterItems] = useState<KitchenItem[]>([]);
    const [prepItems, setPrepItems] = useState<KitchenItem[]>([]);
    const [marinateItems, setMarinateItems] = useState<KitchenItem[]>([]);
    const [potItems, setPotItems] = useState<KitchenItem[]>([]);
    const [barItems, setBarItems] = useState<KitchenItem[]>([]);
    const [submitItems, setSubmitItems] = useState<KitchenItem[]>([]);

    const spawnItem = (ingredient: Ingredient) => {
        const newItem: KitchenItem = {
            ...ingredient,
            instanceId: Math.random().toString(36).substr(2, 9),
            status: 'raw',
            statuses: ['raw'],
            processHistory: [],
        };
        audioService.playPop();
        setCounterItems(prev => [...prev, newItem]);
    };

    const removeItemFromCounter = (item: KitchenItem) => {
        setCounterItems(prev => prev.filter(i => i.instanceId !== item.instanceId));
    };

    const moveItemToStation = (item: KitchenItem, station: 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT') => {
        if (station === 'PREP' && prepItems.length < 20) {
            removeItemFromCounter(item);
            setPrepItems(prev => [...prev, item]);
        } else if (station === 'MARINATE' && marinateItems.length < 20) {
            removeItemFromCounter(item);
            setMarinateItems(prev => [...prev, item]);
        } else if (station === 'BAR' && barItems.length < 20) {
            removeItemFromCounter(item);
            setBarItems(prev => [...prev, item]);
        } else if (station === 'COOK' && potItems.length < 20) {
            removeItemFromCounter(item);
            setPotItems(prev => [...prev, item]);
        } else if (station === 'SUBMIT' && submitItems.length < 20) {
            removeItemFromCounter(item);
            setSubmitItems(prev => [...prev, item]);
        }
        audioService.playClick();
    };

    const returnItemToCounter = (item: KitchenItem, from: 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT') => {
        if (from === 'PREP') setPrepItems(prev => prev.filter(i => i.instanceId !== item.instanceId));
        else if (from === 'MARINATE') setMarinateItems(prev => prev.filter(i => i.instanceId !== item.instanceId));
        else if (from === 'BAR') setBarItems(prev => prev.filter(i => i.instanceId !== item.instanceId));
        else if (from === 'SUBMIT') setSubmitItems(prev => prev.filter(i => i.instanceId !== item.instanceId));
        else setPotItems(prev => prev.filter(i => i.instanceId !== item.instanceId));

        setCounterItems(prev => [...prev, item]);
        audioService.playDelete();
    };

    const updatePrepItems = (newItems: KitchenItem[]) => {
        setCounterItems(prev => [...prev, ...newItems]);
        setPrepItems([]);
    };

    const updateMarinateItems = (newItems: KitchenItem[]) => {
        setCounterItems(prev => [...prev, ...newItems]);
        setMarinateItems([]);
    };

    const updateBarItems = (newItems: KitchenItem[]) => {
        setCounterItems(prev => [...prev, ...newItems]);
        setBarItems([]);
    };

    const updatePotItems = (newItems: KitchenItem[]) => {
        setCounterItems(prev => [...prev, ...newItems]);
        setPotItems([]);
    };

    const clearCookingStations = () => {
        setPotItems([]);
        setBarItems([]);
    };

    const clearSubmitStation = () => {
        setSubmitItems([]);
    };

    // 移动食材到任意工作台
    const moveItemBetweenStations = (item: KitchenItem, fromStation: string, toStation: string) => {
        // 从原工作台移除
        switch (fromStation) {
            case 'counter': setCounterItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); break;
            case 'prep': setPrepItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); break;
            case 'marinate': setMarinateItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); break;
            case 'cook': setPotItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); break;
            case 'bar': setBarItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); break;
            case 'submit': setSubmitItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); break;
        }
        // 添加到目标工作台
        switch (toStation) {
            case 'counter': setCounterItems(prev => [...prev, item]); break;
            case 'prep': setPrepItems(prev => [...prev, item]); break;
            case 'marinate': setMarinateItems(prev => [...prev, item]); break;
            case 'cook': setPotItems(prev => [...prev, item]); break;
            case 'bar': setBarItems(prev => [...prev, item]); break;
            case 'submit': setSubmitItems(prev => [...prev, item]); break;
        }
        audioService.playClick();
    };

    return {
        counterItems, setCounterItems,
        prepItems, setPrepItems,
        marinateItems, setMarinateItems,
        potItems, setPotItems,
        barItems, setBarItems,
        submitItems, setSubmitItems,
        spawnItem,
        removeItemFromCounter,
        moveItemToStation,
        returnItemToCounter,
        updatePrepItems,
        updateMarinateItems,
        updateBarItems,
        updatePotItems,
        clearCookingStations,
        clearSubmitStation,
        moveItemBetweenStations,
    };
};