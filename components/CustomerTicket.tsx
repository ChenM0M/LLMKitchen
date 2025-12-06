
import React from 'react';
import { Customer, Language, GameMode } from '../types';
import { t } from '../translations';
import { Clock } from 'lucide-react';

interface CustomerTicketProps {
  customer: Customer | null;
  isLoading?: boolean;
  language: Language;
  gameMode?: GameMode | null;
  timeLeft?: number;
  maxTime?: number;
}

export const CustomerTicket: React.FC<CustomerTicketProps> = ({ 
  customer, 
  isLoading = false, 
  language,
  gameMode,
  timeLeft = 120,
  maxTime = 120
}) => {
  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 sm:right-8 z-30 animate-pulse">
         <div className="bg-[#fffbf0] p-4 rounded-sm shadow-lg w-[200px] h-[140px] border border-stone-200 rotate-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-stone-300 shadow-sm border border-stone-400 z-10"></div>
            <div className="h-8 bg-stone-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-stone-200 rounded w-2/3"></div>
         </div>
      </div>
    );
  }

  if (!customer) return null;

  const displayName = language === 'zh' ? customer.nameZh || customer.name : customer.name;
  const displayRequest = language === 'zh' ? customer.requestZh || customer.request : customer.request;

  // Timer Calculation
  const timePercent = (timeLeft / maxTime) * 100;
  const isLate = timeLeft <= 30;

  return (
    <div className="absolute top-4 right-4 sm:right-8 z-30 animate-slide-up flex gap-3">
      
      {/* Ticket */}
      <div className="bg-[#fffbf0] text-stone-800 p-4 rounded-sm shadow-lg max-w-[200px] sm:max-w-[240px] border border-stone-200 rotate-2 hover:rotate-0 transition-transform duration-300 relative">
        {/* Pin effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-600 z-10"></div>
        
        <div className="border-b-2 border-dashed border-stone-300 pb-2 mb-2 flex items-center gap-2">
            <div className="text-2xl">{customer.emoji}</div>
            <div>
                <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">{t('customer', language)}</div>
                <div className="font-display font-bold leading-none text-sm">{displayName}</div>
            </div>
        </div>
        
        <div className="font-handwriting font-medium text-sm leading-snug text-stone-700 italic">
            "{displayRequest}"
        </div>

        <div className="mt-3 pt-2 border-t border-stone-100 flex justify-between items-center">
            <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 font-bold uppercase">
                {t('order', language)} #{customer.id.substring(0, 4)}
            </span>
             <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 font-mono">
                ${customer.budget}
            </span>
        </div>
      </div>

      {/* Timer Bar (Only in Challenge Mode) - Moved to Right */}
      {gameMode === 'CHALLENGE' && (
        <div className="h-[180px] w-6 bg-stone-200 rounded-full border-2 border-stone-300 relative overflow-hidden shadow-inner flex flex-col justify-end">
             {/* The Bar */}
             <div 
                className={`w-full transition-all duration-1000 ease-linear
                    ${isLate ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-t from-green-500 to-green-400'}
                `}
                style={{ height: `${timePercent}%` }}
             ></div>

             {/* Icons / Indicators */}
             <div className="absolute top-1 left-1/2 -translate-x-1/2 text-stone-400">
                <Clock size={12} />
             </div>
             {isLate && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-xs animate-bounce">
                    !
                 </div>
             )}
        </div>
      )}

    </div>
  );
};
