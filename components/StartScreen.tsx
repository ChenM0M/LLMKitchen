
import React, { useState } from 'react';
import { ChefHat, Utensils, Trophy, Sparkles, Settings, X, Volume2, Globe, Palette, Play, Trash2 } from 'lucide-react';
import { GameMode, Language, Theme } from '../types';
import { audioService } from '../services/audioService';
import { t } from '../translations';

interface StartScreenProps {
  onSelectMode: (mode: GameMode) => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  // 存档相关
  hasSave?: boolean;
  onContinue?: () => void;
  onNewGame?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onSelectMode, language, onSetLanguage, theme, onSetTheme,
  hasSave, onContinue, onNewGame
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentVol, setCurrentVol] = useState(audioService.getVolume());

  const handleSelect = (mode: GameMode) => {
    audioService.init(); // Initialize audio context on user gesture
    audioService.playClick();

    if (mode === 'CHALLENGE' && onNewGame) {
      onNewGame();
    }
    onSelectMode(mode);
  };

  const handleContinue = () => {
    audioService.init();
    audioService.playClick();
    if (onContinue) {
      onContinue();
    }
    onSelectMode('CHALLENGE');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentVol(val);
    audioService.setVolume(val);
  };

  const handleVolumePreview = () => {
    // Ensure context is running if they adjust volume before clicking a game mode
    audioService.init();
    audioService.playClick();
  };

  const isJapanese = theme === 'japanese';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500
        ${isJapanese ? 'bg-seigaiha text-stone-800' : 'bg-[#fef3c7]'}`}
    >

      {/* Background decoration */}
      {!isJapanese && <div className="absolute inset-0 bg-kitchen-tile opacity-50 pointer-events-none"></div>}

      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float-bob">
        {isJapanese ? '🍣' : '🥦'}
      </div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-float delay-700">
        {isJapanese ? '🍵' : '🥩'}
      </div>
      <div className="absolute top-1/4 right-20 text-6xl opacity-10 animate-spin-fast duration-[10s]">
        {isJapanese ? '🍙' : '🍳'}
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className={`absolute top-6 right-6 p-3 bg-white/90 hover:bg-white text-stone-600 rounded-2xl shadow-sm hover:shadow-md transition-all z-50 border-2 group
            ${isJapanese ? 'border-jp-indigo text-jp-indigo rounded-lg' : 'border-stone-100 rounded-2xl'}
        `}
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSettings(false)}
          />
          <div className={`bg-white p-8 w-full max-w-sm shadow-2xl relative z-10 animate-slide-up border-4
                ${isJapanese ? 'rounded-lg border-jp-800 font-serif' : 'rounded-[2rem] border-stone-100'}
            `}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${isJapanese ? 'text-jp-indigo' : 'font-display text-stone-800'}`}>
                <Settings className={isJapanese ? "text-jp-indigo" : "text-chef-500"} />
                {t('settings', language)}
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Volume */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isJapanese ? 'bg-indigo-50 text-jp-indigo' : 'bg-blue-50 text-blue-500'}`}>
                      <Volume2 size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-stone-700">{t('soundVolume', language)}</div>
                      <div className="text-xs text-stone-400 font-medium">SFX & Ambience</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full min-w-[3rem] text-center">
                    {Math.round(currentVol * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentVol}
                  onChange={handleVolumeChange}
                  onMouseUp={handleVolumePreview}
                  onTouchEnd={handleVolumePreview}
                  className={`w-full h-4 bg-stone-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 
                                ${isJapanese ? 'accent-jp-indigo focus:ring-indigo-200' : 'accent-chef-500 focus:ring-chef-200'}
                            `}
                />
              </div>

              {/* Theme Toggle */}
              <div className="pt-6 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isJapanese ? 'bg-red-50 text-red-800' : 'bg-orange-50 text-orange-500'}`}>
                      <Palette size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-stone-700">{t('theme', language)}</div>
                    </div>
                  </div>

                  <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button
                      onClick={() => onSetTheme('default')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'default' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      {t('themeDefault', language)}
                    </button>
                    <button
                      onClick={() => onSetTheme('japanese')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'japanese' ? 'bg-white shadow-sm text-jp-indigo' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      {t('themeJapanese', language)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Language Toggle */}
              <div className="pt-6 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isJapanese ? 'bg-green-50 text-green-700' : 'bg-green-50 text-green-500'}`}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-stone-700">{t('language', language)}</div>
                    </div>
                  </div>

                  <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button
                      onClick={() => onSetLanguage('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => onSetLanguage('zh')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'zh' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      中文
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-400">
                {t('version', language)}
              </p>
            </div>

          </div>
        </div>
      )}

      <div className="relative z-10 max-w-2xl w-full text-center">

        {/* Logo/Header */}
        <div className="mb-12 animate-slide-up">
          <div className={`inline-block p-6 mb-6 shadow-2xl transition-all
             ${isJapanese ? 'bg-white rounded-xl ring-4 ring-jp-800' : 'bg-white rounded-full ring-8 ring-stone-100'}
          `}>
            <ChefHat size={64} className={isJapanese ? "text-jp-indigo" : "text-chef-500"} />
          </div>
          <h1 className={`text-5xl md:text-6xl font-black text-stone-800 mb-2 drop-shadow-sm tracking-tight ${isJapanese ? 'font-serif' : 'font-display'}`}>
            AI Pocket Kitchen
          </h1>
          <p className="text-xl text-stone-500 font-medium">
            {t('cookAnything', language)}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>

          {/* Sandbox Mode */}
          <button
            onClick={() => handleSelect('SANDBOX')}
            className={`group relative bg-white p-8 border-4 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center
                ${isJapanese ? 'rounded-lg border-stone-200 hover:border-jp-indigo font-serif' : 'rounded-3xl border-stone-100 hover:border-chef-300 font-display'}
            `}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform
                 ${isJapanese ? 'bg-indigo-50 text-jp-indigo' : 'bg-blue-100 text-blue-500'}
            `}>
              <Utensils size={32} />
            </div>
            <h3 className={`text-2xl font-bold text-stone-800 mb-2 ${isJapanese ? 'group-hover:text-jp-indigo' : 'group-hover:text-chef-600'}`}>{t('sandboxMode', language)}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              {t('sandboxDesc', language)}
            </p>
            <div className={`mt-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full
                 ${isJapanese ? 'bg-indigo-50 text-jp-indigo' : 'bg-blue-50 text-blue-400'}
            `}>
              {t('freePlay', language)}
            </div>
          </button>

          {/* Challenge Mode */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSelect('CHALLENGE')}
              className={`group relative bg-white p-8 border-4 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center
                  ${isJapanese ? 'rounded-lg border-stone-200 hover:border-jp-indigo font-serif' : 'rounded-3xl border-stone-100 hover:border-chef-300 font-display'}
              `}
            >
              <div className="absolute top-4 right-4">
                <Sparkles className="text-yellow-400 animate-pulse" />
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform
                   ${isJapanese ? 'bg-orange-50 text-orange-600' : 'bg-orange-100 text-orange-500'}
              `}>
                <Trophy size={32} />
              </div>
              <h3 className={`text-2xl font-bold text-stone-800 mb-2 ${isJapanese ? 'group-hover:text-jp-indigo' : 'group-hover:text-chef-600'}`}>{t('challengeMode', language)}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {t('challengeDesc', language)}
              </p>
              <div className={`mt-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full
                   ${isJapanese ? 'bg-orange-50 text-orange-600' : 'bg-orange-50 text-orange-400'}
              `}>
                {hasSave ? (language === 'zh' ? '新游戏' : 'New Game') : t('career', language)}
              </div>
            </button>

            {/* 继续游戏按钮 */}
            {hasSave && (
              <button
                onClick={handleContinue}
                className={`group bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 border-4 border-green-400 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3
                    ${isJapanese ? 'rounded-lg font-serif' : 'rounded-2xl font-display'}
                `}
              >
                <Play size={24} />
                <span className="text-lg font-bold">
                  {language === 'zh' ? '继续游戏' : 'Continue'}
                </span>
              </button>
            )}
          </div>

        </div>

        <p className="mt-12 text-stone-400 text-sm font-medium">
          {t('poweredBy', language)}
        </p>

      </div>
    </div>
  );
};