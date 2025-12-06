import React from 'react';
import { Settings, Wallet, Clock, Trophy } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { GameButton } from '../ui/GameButton';
import { Badge } from '../ui/Badge';
import { t } from '../../translations';
import { Language, GameMode } from '../../types';

interface TopBarProps {
    money: number;
    day: number;
    timeLeft: number;
    gameMode: GameMode;
    language: Language;
    onOpenSettings: () => void;
    dailyRevenue: number;
}

export const TopBar: React.FC<TopBarProps> = ({
    money,
    day,
    timeLeft,
    gameMode,
    language,
    onOpenSettings,
    dailyRevenue
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[40] p-2 sm:p-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-start justify-between pointer-events-auto">

                {/* Left: Money & Stats */}
                <div className="flex flex-col gap-2">
                    <GlassPanel className="flex items-center gap-2 px-3 py-1.5 rounded-full" intensity="low">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-sm">
                            <Wallet size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-stone-500 leading-none">{t('money', language)}</span>
                            <span className="font-display font-bold text-lg leading-none text-stone-800">${money}</span>
                        </div>
                        {dailyRevenue > 0 && (
                            <Badge variant="success" size="sm" className="ml-1">
                                +${dailyRevenue}
                            </Badge>
                        )}
                    </GlassPanel>
                </div>

                {/* Center: Timer (Challenge Mode) */}
                {gameMode === 'CHALLENGE' && (
                    <GlassPanel className="absolute left-1/2 -translate-x-1/2 top-2 sm:top-4 px-4 py-1.5 rounded-2xl flex items-center gap-2" intensity="medium">
                        <Clock size={18} className={timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-stone-600'} />
                        <span className={`font-display font-bold text-xl ${timeLeft < 30 ? 'text-red-600' : 'text-stone-800'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </GlassPanel>
                )}

                {/* Right: Settings & Day */}
                <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                        <GlassPanel className="px-3 py-1.5 rounded-full flex items-center gap-2" intensity="low">
                            <Trophy size={16} className="text-amber-500" />
                            <span className="font-display font-bold text-stone-700">Day {day}</span>
                        </GlassPanel>

                        <GameButton variant="ghost" size="icon" onClick={onOpenSettings} className="bg-white/50 backdrop-blur-sm">
                            <Settings size={20} />
                        </GameButton>
                    </div>
                </div>

            </div>
        </div>
    );
};
