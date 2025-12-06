
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { t } from '../translations';
import { Language } from '../types';

interface DayProgressBarProps {
  day: number;
  timeLeft: number;
  maxTime: number;
  language: Language;
}

export const DayProgressBar: React.FC<DayProgressBarProps> = ({ day, timeLeft, maxTime, language }) => {
  const percentage = (timeLeft / maxTime) * 100;
  
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Sky Color transition based on time (Light Blue -> Orange -> Dark Blue)
  let skyColor = 'bg-sky-400';
  if (percentage < 30) skyColor = 'bg-indigo-900'; // Night approaching
  else if (percentage < 60) skyColor = 'bg-orange-400'; // Sunset
  
  return (
    <div className="w-full bg-stone-800 text-white p-2 shadow-md flex items-center justify-between gap-4 border-b border-stone-700 relative overflow-hidden">
        
        {/* Day Indicator */}
        <div className="flex items-center gap-2 z-10 px-2 bg-stone-900/50 rounded-lg">
            <span className="text-yellow-400 font-bold">{t('day', language)} {day}</span>
        </div>

        {/* Progress Track */}
        <div className="flex-1 h-6 bg-stone-700 rounded-full relative overflow-hidden border border-stone-600">
            {/* Moving Sky Background */}
            <div 
                className={`absolute inset-0 transition-colors duration-1000 ${skyColor}`}
                style={{ width: `${percentage}%`, transition: 'width 1s linear' }}
            >
                {/* Sun/Moon Animation */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    {percentage < 30 ? (
                        <Moon className="text-yellow-100 w-4 h-4 animate-pulse" />
                    ) : (
                        <Sun className="text-yellow-300 w-4 h-4 animate-spin-slow" />
                    )}
                </div>
            </div>
            
            {/* Time Text */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold drop-shadow-md z-10">
                {timeString}
            </div>
        </div>

        {/* Shop Status */}
        <div className="z-10 text-xs font-bold uppercase tracking-wide px-2">
            {timeLeft <= 0 ? <span className="text-red-400">{t('shopClosed', language)}</span> : <span className="text-green-400">OPEN</span>}
        </div>
    </div>
  );
};
