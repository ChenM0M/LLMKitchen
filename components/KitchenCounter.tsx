

import React from 'react';
import { KitchenItem, Language, Theme } from '../types';
import { Trash2, Scissors, Zap, Droplets, Wind } from 'lucide-react';
import { t } from '../translations';
import { DraggableIngredient } from './DraggableIngredient';

interface KitchenCounterProps {
  items: KitchenItem[];
  onItemClick: (item: KitchenItem) => void;
  onItemDelete: (item: KitchenItem) => void;
  activeStationLabel: string;
  language: Language;
  theme: Theme;
}

export const KitchenCounter: React.FC<KitchenCounterProps> = ({
  items,
  onItemClick,
  onItemDelete,
  activeStationLabel,
  language,
  theme
}) => {

  const getStatusBadges = (item: KitchenItem) => {
    return (
      <div className="absolute -top-2 -right-2 flex flex-col gap-0.5 items-end z-20 pointer-events-none">
        {item.status === 'chopped' && (
          <div className="bg-stone-700 text-white p-1 rounded-full shadow-md border border-white"><Scissors size={10} /></div>
        )}
        {item.status === 'blended' && (
          <div className="bg-purple-500 text-white p-1 rounded-full shadow-md border border-white"><Zap size={10} /></div>
        )}
        {item.status === 'dried' && (
          <div className="bg-blue-400 text-white p-1 rounded-full shadow-md border border-white"><Wind size={10} /></div>
        )}
        {(item.status === 'marinated' || (item.marinadeLabels && item.marinadeLabels.length > 0)) && (
          <div className="bg-amber-600 text-white p-1 rounded-full shadow-md border border-white"><Droplets size={10} /></div>
        )}
      </div>
    );
  };

  // 状态翻译映射
  const STATUS_TRANSLATIONS: Record<string, { zh: string; en: string }> = {
    raw: { zh: '生', en: 'Raw' },
    chopped: { zh: '切碎', en: 'Chopped' },
    sliced: { zh: '切片', en: 'Sliced' },
    julienned: { zh: '切丝', en: 'Julienned' },
    mashed: { zh: '捣碎', en: 'Mashed' },
    blended: { zh: '搅拌', en: 'Blended' },
    dried: { zh: '风干', en: 'Dried' },
    marinated: { zh: '腌制', en: 'Marinated' },
    fried: { zh: '煎', en: 'Fried' },
    deep_fried: { zh: '炸', en: 'Deep Fried' },
    stir_fried: { zh: '炒', en: 'Stir Fried' },
    boiled: { zh: '煮', en: 'Boiled' },
    steamed: { zh: '蒸', en: 'Steamed' },
    braised: { zh: '炖', en: 'Braised' },
    baked: { zh: '烤', en: 'Baked' },
    grilled: { zh: '烧烤', en: 'Grilled' },
    microwaved: { zh: '微波', en: 'Microwaved' },
    shaken: { zh: '摇匀', en: 'Shaken' },
    stirred: { zh: '搅拌', en: 'Stirred' },
    layered: { zh: '分层', en: 'Layered' },
  };

  const translateStatus = (status: string): string => {
    const t = STATUS_TRANSLATIONS[status];
    return t ? (language === 'zh' ? t.zh : t.en) : status;
  };

  const getStatusText = (item: KitchenItem) => {
    let texts: string[] = [];

    // 显示所有非 raw 状态
    if (item.statuses && item.statuses.length > 0) {
      texts = item.statuses.filter(s => s !== 'raw').map(s => translateStatus(s));
    } else if (item.status && item.status !== 'raw') {
      texts = [translateStatus(item.status)];
    }

    if (item.marinadeLabels && item.marinadeLabels.length > 0 && !texts.includes(translateStatus('marinated'))) {
      texts.push(translateStatus('marinated'));
    }

    return texts.join(' + ');
  };

  const isJapanese = theme === 'japanese';

  return (
    <div className={`kitchen-counter border-t-2 sm:border-t-4 p-3 xs:p-4 sm:p-5 absolute bottom-0 left-0 right-0 h-44 xs:h-48 sm:h-52 md:h-60 flex flex-col z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-all
        ${isJapanese ? 'bg-wood-dark border-jp-800' : 'bg-gradient-to-t from-stone-200 to-stone-100 border-stone-300'}
    `}>
      <div className="flex justify-between items-center mb-2 px-1 flex-shrink-0">
        <h3 className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2 drop-shadow-sm
             ${isJapanese ? 'text-stone-200' : 'text-stone-500'}
        `}>
          <span>{t('kitchenCounter', language)}</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] min-w-[20px] text-center border
                 ${isJapanese ? 'bg-jp-800 text-white border-jp-900' : 'bg-stone-200 text-stone-600 border-stone-300'}
            `}>{items.length}</span>
        </h3>
        <span className={`text-[9px] sm:text-xs font-bold truncate ml-2 backdrop-blur-sm px-2.5 py-1 rounded-full border shadow-sm
             ${isJapanese ? 'text-white bg-jp-indigo/80 border-indigo-300' : 'text-chef-700 bg-white/80 border-chef-200'}
        `}>
          {t('tapToAdd', language)} {activeStationLabel}
        </span>
      </div>

      <div className="flex gap-4 sm:gap-5 overflow-x-auto flex-1 items-center px-2 scrollbar-hide w-full">
        {items.length === 0 && (
          <div className={`w-full h-full flex flex-col items-center justify-center text-xs sm:text-sm font-medium italic opacity-60
                 ${isJapanese ? 'text-white/40' : 'text-stone-400'}
            `}>
            <div className="text-xl sm:text-2xl mb-1">🍽️</div>
            {language === 'zh' ? '台面空空如也' : 'Counter is empty'}
          </div>
        )}

        {items.map((item) => {
          const displayName = language === 'zh' ? item.nameZh || item.name : item.name;
          const statusText = getStatusText(item);

          return (
            <div key={item.instanceId} className="group flex-shrink-0 flex flex-col items-center relative">
              {/* 卡片本体 */}
              <div className="relative transition-all hover:-translate-y-1">
                <DraggableIngredient
                  item={item}
                  language={language}
                  sourceStation="COUNTER"
                  onClick={() => onItemClick(item)}
                  onRemove={() => onItemDelete(item)}
                  showStatus={false}
                />
              </div>

              {/* 名称标签 - 独立显示 */}
              <div className="mt-1 text-center w-20 sm:w-24">
                {statusText && (
                  <div className="text-[9px] sm:text-[10px] text-orange-600 font-medium capitalize bg-orange-50 rounded px-1 py-0.5 mb-0.5 inline-block">
                    {statusText}
                  </div>
                )}
                <div className="text-[10px] sm:text-xs font-bold text-stone-700 leading-tight break-words" title={displayName}>
                  {displayName}
                </div>
              </div>
            </div>
          );
        })}
        {/* Spacer for scrolling */}
        <div className="w-8 flex-shrink-0"></div>
      </div>
    </div>
  );
};