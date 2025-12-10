import React, { useState, useEffect, useCallback } from 'react';
import { PrepMethod, HeatMethod, MixMethod, MarinateMethod, AnyCookingMethod, KitchenItem, StationType, QTERating, QTEDifficulty, JudgePersona } from './types';
import { Pantry } from './components/Pantry';
import { KitchenCounter } from './components/KitchenCounter';
import { WorkStation } from './components/WorkStation';
import { DragDropProvider } from './components/DragDropContext';
import { DraggableIngredient } from './components/DraggableIngredient';
import { ResultModal } from './components/ResultModal';
import { StartScreen } from './components/StartScreen';
import { RecipeBook } from './components/RecipeBook';
import { useDailyEvent } from './hooks/useDailyEvent';
import { PlayerManual } from './components/PlayerManual';
import { DayProgressBar } from './components/DayProgressBar';
import { DaySummaryModal } from './components/DaySummaryModal';
import { audioService } from './services/audioService';
import { CookingQTE, QTE_RATINGS } from './components/CookingQTE'; // QTERating and QTEDifficulty moved to types
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ArrowLeft, BookOpen, Wallet, HelpCircle, Settings, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { t } from './translations';

// Hooks
import { useInventory } from './hooks/useInventory';
import { useGameSession } from './hooks/useGameSession';
import { useCustomerManager } from './hooks/useCustomerManager';
import { useCookingFlow } from './hooks/useCookingFlow';

const App: React.FC = () => {
    // --- 1. State Hooks ---
    const {
        gameMode, setGameMode, money, setMoney, day, dayTimeLeft,
        dailyRevenue, showDaySummary, setShowDaySummary, showGameOver, setShowGameOver,
        handleTransaction, startNextDay, language, setLanguage, theme, setTheme, RENT_COST, DAY_LENGTH,
        // 存档
        hasSave, loadGame, startNewGame
    } = useGameSession();

    const inventory = useInventory();
    const cooking = useCookingFlow(language);

    const customerManager = useCustomerManager(
        gameMode,
        language,
        cooking.isCooking,
        !!cooking.lastResult,
        showDaySummary,
        () => inventory.clearCookingStations() // onTimeout cleanup
    );

    // --- 2. UI State ---
    const [activeStation, setActiveStation] = useState<'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT'>('PREP');
    const [selectedHeat, setSelectedHeat] = useState<HeatMethod | 'raw' | null>(null);
    const [selectedMix, setSelectedMix] = useState<MixMethod | null>(null);
    const [showRecipeBook, setShowRecipeBook] = useState(false);

    // Daily Events (Roguelike)
    const { currentEvent, showEventModal, closeEventModal } = useDailyEvent(day);
    const [showManual, setShowManual] = useState(false);
    const [isPantryOpen, setIsPantryOpen] = useState(false);
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [showApiSettings, setShowApiSettings] = useState(false);

    // QTE 状态 - 从localStorage加载初始值
    const [showQTE, setShowQTE] = useState(false);
    const [qteMethod, setQteMethod] = useState<AnyCookingMethod | null>(null);
    const [lastQTERating, setLastQTERating] = useState<QTERating | null>(null);
    const [qteDifficulty, setQTEDifficulty] = useState<QTEDifficulty>(() => {
        const saved = localStorage.getItem('cookingGenius_qteDifficulty');
        return (saved as QTEDifficulty) || 'normal';
    });
    const [judgePersona, setJudgePersona] = useState<JudgePersona>(() => {
        const saved = localStorage.getItem('cookingGenius_judgePersona');
        return (saved as JudgePersona) || 'standard';
    });

    // 保存游戏设置到localStorage
    useEffect(() => {
        localStorage.setItem('cookingGenius_qteDifficulty', qteDifficulty);
    }, [qteDifficulty]);

    useEffect(() => {
        localStorage.setItem('cookingGenius_judgePersona', judgePersona);
    }, [judgePersona]);


    // Drag and drop handler
    const handleItemDrop = useCallback((item: KitchenItem, targetStation: StationType, sourceStation?: string) => {
        if (showDaySummary || dayTimeLeft <= 0) return;

        const stationMap: Record<string, 'PREP' | 'MARINATE' | 'COOK' | 'BAR' | 'SUBMIT'> = {
            'prep': 'PREP',
            'marinate': 'MARINATE',
            'cook': 'COOK',
            'bar': 'BAR',
            'submit': 'SUBMIT'
        };
        const targetStationUpper = stationMap[targetStation];

        if (sourceStation) {
            // Universal handling for all moves (Counter->Station, Station->Station, Submit->Station)
            const from = sourceStation.toLowerCase();
            const to = targetStation.toLowerCase();

            if (from !== to) {
                inventory.moveItemBetweenStations(item, from, to);
                if (targetStationUpper) setActiveStation(targetStationUpper);
            }
        } else if (targetStationUpper) {
            // Fallback for items without source (should be rare/legacy)
            inventory.moveItemToStation(item, targetStationUpper);
            setActiveStation(targetStationUpper);
        }
    }, [showDaySummary, dayTimeLeft, inventory]);

    // --- 3. Effects ---

    // Load new customer on day change (if challenge mode)
    useEffect(() => {
        if (gameMode === 'CHALLENGE' && !showDaySummary && !showGameOver) {
            customerManager.loadNewCustomer();
        }
    }, [day, gameMode, showDaySummary]);

    // Check Bankruptcy
    useEffect(() => {
        const isInventoryEmpty = inventory.counterItems.length === 0 &&
            inventory.prepItems.length === 0 &&
            inventory.marinateItems.length === 0 &&
            inventory.potItems.length === 0 &&
            inventory.barItems.length === 0;

        if (gameMode === 'CHALLENGE' && money < 3 && isInventoryEmpty && !cooking.isCooking && !cooking.lastResult && !showDaySummary) {
            setShowGameOver(true);
        }
    }, [money, inventory, cooking.isCooking, gameMode, cooking.lastResult, showDaySummary]);


    // --- 4. Event Handlers ---

    const handleSpawnItem = (item: any) => {
        if (showDaySummary || dayTimeLeft <= 0) return;
        if (gameMode === 'CHALLENGE') {
            if (money < item.price) {
                audioService.playDelete();
                return;
            }
            handleTransaction(-item.price);
        }
        inventory.spawnItem(item);
    };

    const handleCounterItemClick = (item: any) => {
        inventory.moveItemToStation(item, activeStation);
    };

    const handleCounterItemDelete = (item: any) => {
        audioService.playDelete();
        if (gameMode === 'CHALLENGE' && item.status === 'raw') {
            handleTransaction(item.price); // Refund
        }
        inventory.removeItemFromCounter(item);
    };

    const handlePrepAction = (method: PrepMethod, mode: 'MERGE' | 'SEPARATE' = 'SEPARATE') => {
        if (inventory.prepItems.length === 0 || dayTimeLeft <= 0) return;
        cooking.performPrep(inventory.prepItems, method, inventory.updatePrepItems, mode);
    };

    const handleMarinateAction = () => {
        if (inventory.marinateItems.length === 0 || dayTimeLeft <= 0) return;
        cooking.performMarinate(inventory.marinateItems, inventory.updateMarinateItems);
    };

    const handleProcess = (method: AnyCookingMethod) => {
        if (dayTimeLeft <= 0) return;

        // Determine items and update callback based on active station/method
        let items: KitchenItem[] = [];
        let updateCallback: ((items: KitchenItem[]) => void) | null = null;

        if (activeStation === 'BAR') {
            items = inventory.barItems;
            updateCallback = inventory.updateBarItems;
        } else if (activeStation === 'COOK') {
            items = inventory.potItems;
            updateCallback = inventory.updatePotItems;
        }

        if (items.length > 0 && updateCallback) {
            // 无QTE模式：直接处理（评级为perfect）
            if (qteDifficulty === 'none') {
                cooking.performProcess(items, method, updateCallback, 'perfect');
            } else {
                // 触发 QTE 小游戏
                setQteMethod(method);
                setShowQTE(true);
            }
        }
    };

    // QTE 完成后的处理
    const handleQTEComplete = (rating: QTERating) => {
        setShowQTE(false);
        setLastQTERating(rating);

        if (!qteMethod) return;

        let items: KitchenItem[] = [];
        let updateCallback: ((items: KitchenItem[]) => void) | null = null;

        if (activeStation === 'BAR') {
            items = inventory.barItems;
            updateCallback = inventory.updateBarItems;
        } else if (activeStation === 'COOK') {
            items = inventory.potItems;
            updateCallback = inventory.updatePotItems;
        }

        if (items.length > 0 && updateCallback) {
            // 根据 QTE 评级设置处理质量
            const qualityMap: Record<QTERating, string> = {
                failed: 'burnt',
                poor: 'undercooked',
                mediocre: 'mediocre',
                normal: 'normal',
                excellent: 'excellent',
                perfect: 'perfect'
            };

            // 执行烹饪处理，传入评级
            cooking.performProcess(items, qteMethod, updateCallback, rating);
        }

        setQteMethod(null);
    };

    const handleQTECancel = () => {
        setShowQTE(false);
        setQteMethod(null);
    };

    const handleStartCooking = () => {
        if (dayTimeLeft <= 0 || cooking.isSubmitting) return;

        let method: AnyCookingMethod | null = null;
        if (activeStation === 'BAR') {
            if (inventory.barItems.length === 0) return;
            method = selectedMix;
        } else {
            if (inventory.potItems.length === 0) return;
            method = selectedHeat === 'raw' ? null : selectedHeat;
        }

        if (method) {
            cooking.startCookingAnimation(method);
        }
    };

    const handleCook = async (precision: any = 'perfect') => {
        if (cooking.isSubmitting || dayTimeLeft <= 0) return;

        // 使用出盘台的食材
        const itemsToProcess = inventory.submitItems;
        if (itemsToProcess.length === 0) return;

        // 根据食材历史确定烹饪方法
        const lastMethod = itemsToProcess[0]?.processHistory?.slice(-1)[0]?.method || null;

        const result = await cooking.performCook(
            itemsToProcess,
            lastMethod,
            customerManager.currentCustomer,
            precision,
            judgePersona
        );

        if (result && gameMode === 'CHALLENGE' && customerManager.currentCustomer) {
            // Economy Logic
            let cost = itemsToProcess.reduce((sum, i) => sum + i.price, 0);
            let multiplier = 0.5;
            if (result.score > 30) multiplier = 0.8;
            if (result.score > 50) multiplier = 1.0;
            if (result.score > 70) multiplier = 1.2;
            if (result.score > 85) multiplier = 1.5;
            if (result.score > 95) multiplier = 2.0;

            let revenue = Math.round(customerManager.currentCustomer.budget * multiplier);

            // Late Penalty
            if (customerManager.timeLeft <= 30) {
                const penalty = Math.round(revenue * 0.2);
                revenue -= penalty;
                result.latePenalty = penalty;
            }

            result.cost = cost;
            result.revenue = revenue;
            result.profit = revenue - cost;

            if (result.score >= 50) {
                result.customerSatisfied = true;
                handleTransaction(revenue);
                audioService.playWin();
            } else {
                result.customerSatisfied = false;
                audioService.playFailure();
            }

            // Update the result in state with financials
            cooking.setLastResult({ ...result });
        } else if (result) {
            // Sandbox Audio
            if (result.score > 70) audioService.playWin();
            else audioService.playSuccess();
        }

        if (result) {
            // 清空出盘台 - 只有成功时才清空，失败时保留（相当于退还）
            inventory.clearSubmitStation();
        }
    };

    const handleReset = () => {
        cooking.resetResult();
        if (gameMode === 'CHALLENGE' && customerManager.currentCustomer) {
            customerManager.loadNewCustomer();
        }
    };

    // --- 5. Render ---

    if (!gameMode) {
        return <StartScreen
            onSelectMode={setGameMode}
            language={language}
            onSetLanguage={setLanguage}
            theme={theme}
            onSetTheme={setTheme}
            hasSave={hasSave}
            onContinue={loadGame}
            onNewGame={startNewGame}
        />;
    }

    const isJapanese = theme === 'japanese';

    return (
        <DragDropProvider onItemDrop={handleItemDrop}>
            <div className={`h-[100dvh] flex flex-col overflow-hidden relative transition-colors duration-500
        ${isJapanese ? 'bg-seigaiha text-stone-800' : 'bg-[#fef3c7]'}
    `}>
                {!isJapanese && <div className="absolute inset-0 bg-kitchen-tile opacity-30 pointer-events-none"></div>}

                {/* Top Bar */}
                <div className={`flex justify-between items-center p-2 sm:p-4 z-30 shadow-sm border-b relative
          ${isJapanese ? 'bg-white/90 border-stone-200' : 'bg-white/80 border-stone-200 backdrop-blur-md'}
      `}>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setGameMode(null)}
                            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                            title={t('backToMenu', language)}
                        >
                            <ArrowLeft size={20} className={isJapanese ? "text-jp-indigo" : "text-stone-600"} />
                        </button>
                        {gameMode === 'CHALLENGE' ? (
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm ${money < 20 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : (isJapanese ? 'bg-indigo-50 border-indigo-100 text-jp-indigo' : 'bg-green-50 border-green-200 text-green-700')}`}>
                                    <Wallet size={16} />
                                    <span className="font-mono font-bold">${money}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm
                    ${isJapanese ? 'bg-indigo-50 text-jp-indigo border-indigo-100' : 'bg-blue-50 text-blue-500 border-blue-100'}
                 `}>
                                {t('sandboxMode', language)}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowManual(true)}
                            className={`p-2 rounded-full border shadow-sm transition-all
                    ${isJapanese ? 'bg-indigo-50 text-jp-indigo border-indigo-100 hover:bg-indigo-100' : 'bg-blue-50 text-blue-500 border-blue-200 hover:bg-blue-100'}
                `}
                            title={t('howToPlay', language)}
                        >
                            <HelpCircle size={20} />
                        </button>
                        <button
                            onClick={() => setShowRecipeBook(true)}
                            className={`p-2 rounded-full border shadow-sm transition-all
                    ${isJapanese ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-orange-100 text-orange-500 border-orange-200 hover:bg-orange-200'}
                `}
                            title={t('myCookbook', language)}
                        >
                            <BookOpen size={20} />
                        </button>
                        <button
                            onClick={() => setShowApiSettings(true)}
                            className={`p-2 rounded-full border shadow-sm transition-all
                    ${isJapanese ? 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'}
                `}
                            title={language === 'zh' ? 'API 设置' : 'API Settings'}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {gameMode === 'CHALLENGE' && (
                    <DayProgressBar day={day} timeLeft={dayTimeLeft} maxTime={DAY_LENGTH} language={language} />
                )}

                {/* ========== 主工作区：电脑端三栏 / 手机端垂直 ========== */}
                <div className="flex-1 flex overflow-hidden">

                    {/* === 左侧栏：食材库 (仅电脑端显示) === */}
                    <div className="hidden lg:flex lg:w-72 xl:w-80 flex-col border-r-2 border-stone-200 bg-[#f3e6d3] shadow-inner">
                        <div className="p-3 bg-[#e8d5b5] border-b border-[#c7a677]">
                            <h2 className="text-lg font-bold text-[#8c6b4a]">🥬 {t('pantry', language)}</h2>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Pantry
                                onSpawnItem={handleSpawnItem}
                                language={language}
                                gameMode={gameMode || 'SANDBOX'}
                                money={money}
                                theme={theme}
                            />
                        </div>
                    </div>

                    {/* === 中央：工作区 === */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* 工作站 */}
                        <div className="flex-1 relative overflow-hidden">
                            <WorkStation
                                mode={activeStation}
                                onSetMode={setActiveStation}

                                prepItems={inventory.prepItems}
                                onPrepAction={handlePrepAction}
                                onRemovePrepItem={(item) => inventory.returnItemToCounter(item, 'PREP')}

                                marinateItems={inventory.marinateItems}
                                onRemoveMarinateItem={(item) => inventory.returnItemToCounter(item, 'MARINATE')}
                                onMarinateAction={handleMarinateAction}

                                barItems={inventory.barItems}
                                onRemoveBarItem={(item) => inventory.returnItemToCounter(item, 'BAR')}
                                selectedMix={selectedMix}
                                onSelectMix={setSelectedMix}
                                onProcess={handleProcess}

                                potItems={inventory.potItems}
                                onRemovePotItem={(item) => inventory.returnItemToCounter(item, 'COOK')}
                                onCook={handleProcess}
                                selectedHeat={selectedHeat}
                                onSelectHeat={setSelectedHeat}

                                submitItems={inventory.submitItems}
                                onSubmit={() => handleCook('perfect')}
                                onRemoveSubmitItem={(item) => inventory.returnItemToCounter(item, 'SUBMIT')}
                                onClearSubmitItems={inventory.clearSubmitStation}

                                isCooking={cooking.isCooking}
                                isSubmitting={cooking.isSubmitting}
                                history={cooking.history}
                                onShowHistory={cooking.setLastResult}
                                currentCustomer={customerManager.currentCustomer}
                                isLoadingCustomer={customerManager.isLoadingCustomer}
                                activeAnimationMethod={cooking.activeAnimationMethod}
                                language={language}
                                gameMode={gameMode}
                                timeLeft={customerManager.timeLeft}
                                theme={theme}
                            />
                        </div>

                        {/* 手机端底部台面 (电脑端隐藏) */}
                        <div className="lg:hidden h-44 xs:h-48 sm:h-52 relative z-20">
                            <KitchenCounter
                                items={inventory.counterItems}
                                onItemClick={handleCounterItemClick}
                                onItemDelete={handleCounterItemDelete}
                                activeStationLabel={t(activeStation === 'PREP' ? 'prepStation' : activeStation === 'MARINATE' ? 'marinateStation' : activeStation === 'BAR' ? 'barStation' : 'cookingStation', language)}
                                language={language}
                                theme={theme}
                            />
                        </div>
                    </div>

                    {/* === 右侧栏：台面 (仅电脑端显示) === */}
                    <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-l-2 border-stone-200 bg-gradient-to-b from-stone-100 to-stone-200">
                        <div className="p-3 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-stone-600">🍽️ {t('kitchenCounter', language)}</h2>
                            <span className="px-2 py-1 bg-stone-200 rounded-full text-sm font-bold text-stone-600">
                                {inventory.counterItems.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            {inventory.counterItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                                    <span className="text-3xl mb-2">🍽️</span>
                                    <span className="text-sm">{language === 'zh' ? '台面空空如也' : 'Counter is empty'}</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {inventory.counterItems.map((item) => (
                                        <div key={item.instanceId} className="flex flex-col items-center">
                                            <DraggableIngredient
                                                item={item}
                                                language={language}
                                                sourceStation="COUNTER"
                                                onClick={() => handleCounterItemClick(item)}
                                                onRemove={() => handleCounterItemDelete(item)}
                                            />
                                            <span className="text-xs font-medium text-stone-600 mt-1 text-center leading-tight">
                                                {language === 'zh' ? (item.nameZh || item.name) : item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-stone-50 border-t border-stone-200">
                            <p className="text-xs text-stone-500 text-center">
                                {t('tapToAdd', language)} {t(activeStation === 'PREP' ? 'prepStation' : activeStation === 'MARINATE' ? 'marinateStation' : activeStation === 'BAR' ? 'barStation' : 'cookingStation', language)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 手机端滑出式食材库 */}
                <div className="lg:hidden">
                    {isPantryOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/40"
                            onClick={() => setIsPantryOpen(false)}
                        />
                    )}
                    <div className={`pantry-sidebar fixed inset-y-0 left-0 w-[85vw] xs:w-80 sm:w-96 max-w-[320px] sm:max-w-none shadow-2xl transform transition-transform duration-300 z-50 flex flex-col border-r-2 sm:border-r-4 border-[#c7a677]
              ${isPantryOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-2.5 sm:p-4 bg-[#e8d5b5] border-b border-[#c7a677]">
                            <h2 className={`text-base sm:text-xl font-bold text-[#8c6b4a] ${isJapanese ? '' : 'font-display'}`}>{t('pantry', language)}</h2>
                            <button onClick={() => setIsPantryOpen(false)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors">
                                <LogOut size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-[#f3e6d3]">
                            <Pantry
                                onSpawnItem={handleSpawnItem}
                                language={language}
                                gameMode={gameMode || 'SANDBOX'}
                                money={money}
                                theme={theme}
                            />
                        </div>
                    </div>

                    {!isPantryOpen && (
                        <button
                            onClick={() => setIsPantryOpen(true)}
                            className={`fixed left-2 xs:left-3 sm:left-4 bottom-48 xs:bottom-52 sm:bottom-56 z-30 p-2.5 xs:p-3 sm:p-4 rounded-full shadow-xl border-2 sm:border-4 transition-all hover:scale-110 active:scale-95 flex items-center gap-1 sm:gap-2 group
                    ${isJapanese
                                    ? 'bg-jp-800 text-white border-stone-600'
                                    : 'bg-gradient-to-br from-chef-500 to-chef-600 text-white border-white'}
                `}
                        >
                            <span className="text-lg xs:text-xl sm:text-2xl group-hover:rotate-12 transition-transform">🥬</span>
                            <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider hidden sm:inline">{t('pantry', language)}</span>
                        </button>
                    )}
                </div>

                {/* Modals */}
                <ResultModal
                    result={cooking.lastResult}
                    onClose={() => {
                        if (isViewingHistory) {
                            cooking.setLastResult(null);
                            setIsViewingHistory(false);
                        } else {
                            handleReset();
                        }
                    }}
                    onReset={handleReset}
                    customer={customerManager.currentCustomer}
                    language={language}
                    isHistoryView={isViewingHistory}
                    isSaved={cooking.lastResult ? cooking.savedRecipes.some(r => r.dishName === cooking.lastResult?.dishName && r.description === cooking.lastResult?.description) : false}
                    onToggleSave={() => cooking.lastResult && cooking.toggleSaveRecipe(cooking.lastResult)}
                    onUpdateDish={cooking.updateDish}
                />

                <RecipeBook
                    isOpen={showRecipeBook}
                    onClose={() => setShowRecipeBook(false)}
                    history={cooking.history}
                    savedRecipes={cooking.savedRecipes}
                    onToggleSave={cooking.toggleSaveRecipe}
                    onSelectDish={(dish) => {
                        setIsViewingHistory(true);
                        cooking.setLastResult({ ...dish });
                    }}
                    language={language}
                    onDeleteRecipe={cooking.deleteRecipe}
                    onClearAll={cooking.clearAllRecipes}
                    onSort={cooking.sortRecipes}
                />

                <PlayerManual
                    isOpen={showManual}
                    onClose={() => setShowManual(false)}
                    language={language}
                />

                {showDaySummary && (
                    <DaySummaryModal
                        isOpen={showDaySummary}
                        day={day}
                        revenue={dailyRevenue}
                        totalMoney={money}
                        rentCost={RENT_COST}
                        onNextDay={startNextDay}
                        language={language}
                    />
                )}

                {showGameOver && (
                    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white p-8 animate-fadeIn text-center">
                        <div className="text-6xl mb-4 animate-bounce">💸</div>
                        <h1 className="text-4xl font-black mb-2 text-red-500 uppercase tracking-widest">{t('bankrupt', language)}</h1>
                        <p className="text-stone-400 mb-8 max-w-md">{t('bankruptDesc', language)}</p>
                        <button
                            onClick={() => setGameMode(null)}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            {t('backToMenu', language)}
                        </button>
                    </div>
                )}

                {/* API Settings Modal - now includes Gameplay Settings */}
                <ApiSettingsModal
                    isOpen={showApiSettings}
                    onClose={() => setShowApiSettings(false)}
                    language={language}
                    qteDifficulty={qteDifficulty}
                    onQTEDifficultyChange={setQTEDifficulty}
                    judgePersona={judgePersona}
                    setJudgePersona={setJudgePersona}
                />

                {/* Daily Event Modal */}
                {showEventModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scaleIn text-center border-4 border-double border-amber-500/50">
                            <div className="text-6xl mb-4">
                                {currentEvent.type === 'INFLATION' ? '💸' :
                                    currentEvent.type === 'BUSTLING' ? '🏃‍♂️' :
                                        currentEvent.type === 'RAINY' ? '☔' :
                                            currentEvent.type === 'CRITIC' ? '🕵️' : '🏷️'}
                            </div>
                            <h2 className="text-2xl font-bold font-display text-amber-600 mb-2 uppercase tracking-wider">
                                {t('dailyEvent', language)}
                            </h2>
                            <p className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-6">
                                {t(currentEvent.descriptionKey as any, language)}
                            </p>
                            <button
                                onClick={closeEventModal}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-200 dark:shadow-none"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Cooking QTE Game */}
                <CookingQTE
                    isActive={showQTE}
                    onComplete={handleQTEComplete}
                    onCancel={handleQTECancel}
                    language={language}
                    methodName={qteMethod ? (language === 'zh' ? '烹饪中' : 'Cooking') : undefined}
                    difficulty={qteDifficulty}
                />

                <Toaster position="top-center" />

            </div>
        </DragDropProvider>
    );
};

export default App;
