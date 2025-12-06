import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { GameButton } from './ui/GameButton';
import { apiConfigStore, ApiPreset } from '../services/apiSettings';
import { Key, Globe, Cpu, Image, CheckCircle, AlertCircle, Gamepad2, ChefHat, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Language, JudgePersona, QTEDifficulty } from '../types';
import { QTE_DIFFICULTY_CONFIG } from './CookingQTE';
import { JUDGE_PERSONAS } from '../constants';

interface ApiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    qteDifficulty: QTEDifficulty;
    onQTEDifficultyChange: (diff: QTEDifficulty) => void;
    judgePersona: JudgePersona;
    setJudgePersona: (persona: JudgePersona) => void;
}

// 预设编辑组件
const PresetSection: React.FC<{
    type: 'text' | 'image';
    title: string;
    icon: React.ReactNode;
    presets: ApiPreset[];
    activePresetId: string;
    onSelectPreset: (id: string) => void;
    onAddPreset: () => void;
    onDeletePreset: (id: string) => void;
    onRenamePreset: (id: string, name: string) => void;
    onUpdatePreset: (id: string, field: keyof ApiPreset, value: string) => void;
    isZh: boolean;
}> = ({
    type,
    title,
    icon,
    presets,
    activePresetId,
    onSelectPreset,
    onAddPreset,
    onDeletePreset,
    onRenamePreset,
    onUpdatePreset,
    isZh
}) => {
        const [editingName, setEditingName] = useState<string | null>(null);
        const [tempName, setTempName] = useState('');

        const activePreset = presets.find(p => p.id === activePresetId) || presets[0];

        const handleStartRename = (preset: ApiPreset) => {
            setEditingName(preset.id);
            setTempName(preset.name);
        };

        const handleFinishRename = () => {
            if (editingName && tempName.trim()) {
                onRenamePreset(editingName, tempName.trim());
            }
            setEditingName(null);
        };

        return (
            <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-stone-700 font-bold">
                    {icon}
                    <span>{title}</span>
                </div>

                {/* 预设选择 */}
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={activePresetId}
                        onChange={(e) => onSelectPreset(e.target.value)}
                        className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        {presets.map(preset => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={onAddPreset}
                        className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                        title={isZh ? '新建预设' : 'New Preset'}
                    >
                        <Plus size={18} />
                    </button>
                    {presets.length > 1 && (
                        <button
                            onClick={() => activePreset && onDeletePreset(activePreset.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title={isZh ? '删除预设' : 'Delete Preset'}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                {/* 预设名称编辑 */}
                {activePreset && (
                    <div className="flex items-center gap-2">
                        {editingName === activePreset.id ? (
                            <>
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleFinishRename}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFinishRename()}
                                    className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none"
                                    autoFocus
                                />
                                <button onClick={handleFinishRename} className="text-primary-600">
                                    <CheckCircle size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm text-stone-600">{isZh ? '预设名称:' : 'Preset Name:'}</span>
                                <span className="text-sm font-medium">{activePreset.name}</span>
                                <button
                                    onClick={() => handleStartRename(activePreset)}
                                    className="text-stone-400 hover:text-stone-600"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* API配置字段 */}
                {activePreset && (
                    <>
                        <div>
                            <label className="text-xs text-stone-500 mb-1 block flex items-center gap-1">
                                <Globe size={12} />
                                {isZh ? 'API 端点' : 'API Endpoint'}
                            </label>
                            <input
                                type="text"
                                value={activePreset.endpoint}
                                onChange={e => onUpdatePreset(activePreset.id, 'endpoint', e.target.value)}
                                placeholder="https://api.example.com/v1"
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-stone-500 mb-1 block flex items-center gap-1">
                                <Key size={12} />
                                API Key
                            </label>
                            <input
                                type="password"
                                value={activePreset.apiKey}
                                onChange={e => onUpdatePreset(activePreset.id, 'apiKey', e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-stone-500 mb-1 block">
                                {isZh ? '模型名称' : 'Model Name'}
                            </label>
                            <input
                                type="text"
                                value={activePreset.model}
                                onChange={e => onUpdatePreset(activePreset.id, 'model', e.target.value)}
                                placeholder={type === 'text' ? 'gpt-4o-mini' : 'dall-e-3'}
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                    </>
                )}
            </div>
        );
    };

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
    isOpen,
    onClose,
    language,
    qteDifficulty,
    onQTEDifficultyChange,
    judgePersona,
    setJudgePersona
}) => {
    const [config, setConfig] = useState(() => apiConfigStore.getConfig());
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<'gameplay' | 'api'>('gameplay');

    // 重新加载配置
    useEffect(() => {
        if (isOpen) {
            setConfig(apiConfigStore.getConfig());
        }
    }, [isOpen]);

    // 保存配置
    const saveConfig = (newConfig: typeof config) => {
        setConfig(newConfig);
        apiConfigStore.saveConfig(newConfig);
    };

    // 选择预设
    const handleSelectPreset = (type: 'text' | 'image', presetId: string) => {
        const newConfig = { ...config };
        if (type === 'text') {
            newConfig.activeTextPresetId = presetId;
        } else {
            newConfig.activeImagePresetId = presetId;
        }
        saveConfig(newConfig);
    };

    // 添加预设
    const handleAddPreset = (type: 'text' | 'image') => {
        const newPreset: ApiPreset = {
            id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: language === 'zh' ? `新${type === 'text' ? '文字' : '图片'}预设` : `New ${type === 'text' ? 'Text' : 'Image'} Preset`,
            endpoint: '',
            apiKey: '',
            model: ''
        };
        const newConfig = { ...config };
        if (type === 'text') {
            newConfig.textPresets = [...config.textPresets, newPreset];
            newConfig.activeTextPresetId = newPreset.id;
        } else {
            newConfig.imagePresets = [...config.imagePresets, newPreset];
            newConfig.activeImagePresetId = newPreset.id;
        }
        saveConfig(newConfig);
    };

    // 删除预设
    const handleDeletePreset = (type: 'text' | 'image', presetId: string) => {
        const newConfig = { ...config };
        if (type === 'text') {
            if (config.textPresets.length <= 1) return;
            newConfig.textPresets = config.textPresets.filter(p => p.id !== presetId);
            if (config.activeTextPresetId === presetId) {
                newConfig.activeTextPresetId = newConfig.textPresets[0]?.id || '';
            }
        } else {
            if (config.imagePresets.length <= 1) return;
            newConfig.imagePresets = config.imagePresets.filter(p => p.id !== presetId);
            if (config.activeImagePresetId === presetId) {
                newConfig.activeImagePresetId = newConfig.imagePresets[0]?.id || '';
            }
        }
        saveConfig(newConfig);
    };

    // 重命名预设
    const handleRenamePreset = (type: 'text' | 'image', presetId: string, name: string) => {
        const newConfig = { ...config };
        const presets = type === 'text' ? newConfig.textPresets : newConfig.imagePresets;
        const index = presets.findIndex(p => p.id === presetId);
        if (index !== -1) {
            presets[index] = { ...presets[index], name };
        }
        saveConfig(newConfig);
    };

    // 更新预设字段
    const handleUpdatePreset = (type: 'text' | 'image', presetId: string, field: keyof ApiPreset, value: string) => {
        const newConfig = { ...config };
        const presets = type === 'text' ? newConfig.textPresets : newConfig.imagePresets;
        const index = presets.findIndex(p => p.id === presetId);
        if (index !== -1) {
            presets[index] = { ...presets[index], [field]: value };
        }
        saveConfig(newConfig);
    };

    // 测试API
    const handleTest = async () => {
        setTestStatus('testing');
        try {
            const textPreset = config.textPresets.find(p => p.id === config.activeTextPresetId) || config.textPresets[0];
            if (!textPreset?.endpoint || !textPreset?.apiKey) {
                setTestStatus('error');
                return;
            }

            const isGemini = textPreset.endpoint.includes('generativelanguage.googleapis.com');
            let testUrl: string;

            if (isGemini) {
                testUrl = `${textPreset.endpoint}/models?key=${textPreset.apiKey}`;
            } else {
                let baseUrl = textPreset.endpoint.replace(/\/$/, '');
                if (baseUrl.endsWith('/chat/completions')) {
                    baseUrl = baseUrl.replace('/chat/completions', '');
                }
                if (!baseUrl.endsWith('/v1') && !baseUrl.includes('/v1/')) {
                    baseUrl = `${baseUrl}/v1`;
                }
                testUrl = `${baseUrl}/models`;
            }

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (!isGemini) {
                headers['Authorization'] = `Bearer ${textPreset.apiKey}`;
            }

            const response = await fetch(testUrl, { headers });
            if (response.ok) {
                setTestStatus('success');
                setTimeout(() => setTestStatus('idle'), 3000);
            } else {
                setTestStatus('error');
            }
        } catch (e) {
            console.error('API test failed:', e);
            setTestStatus('error');
        }
    };

    const isZh = language === 'zh';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isZh ? '游戏设置' : 'Settings'} size="md">
            <div className="flex flex-col gap-6">

                {/* Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('gameplay')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'gameplay' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Gamepad2 size={16} />
                        {isZh ? '游戏玩法' : 'Gameplay'}
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'api' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Cpu size={16} />
                        {isZh ? 'API 配置' : 'API Config'}
                    </button>
                </div>

                {/* GAMEPLAY SETTINGS */}
                {activeTab === 'gameplay' && (
                    <div className="space-y-6">
                        {/* QTE Difficulty */}
                        <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-stone-700 font-bold">
                                <ChefHat size={18} />
                                <span>{isZh ? 'QTE 难度' : 'QTE Difficulty'}</span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {(['none', 'easy', 'normal', 'hard'] as QTEDifficulty[]).map((diff) => {
                                    const config = QTE_DIFFICULTY_CONFIG[diff];
                                    return (
                                        <button
                                            key={diff}
                                            onClick={() => onQTEDifficultyChange(diff)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${qteDifficulty === diff
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                                                }`}
                                        >
                                            {isZh ? config.label.zh : config.label.en}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Judge Persona */}
                        <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-stone-700 font-bold">
                                <ChefHat size={18} />
                                <span>{isZh ? '评审风格' : 'Judge Persona'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(JUDGE_PERSONAS) as JudgePersona[]).map((personaKey) => {
                                    const personaConfig = JUDGE_PERSONAS[personaKey];
                                    const isActive = judgePersona === personaKey;
                                    return (
                                        <button
                                            key={personaKey}
                                            onClick={() => setJudgePersona(personaKey)}
                                            className={`p-3 rounded-xl text-left flex items-start gap-3 transition-all border-2 ${isActive
                                                    ? 'border-chef-500 bg-chef-50'
                                                    : 'border-stone-200 bg-white hover:border-stone-300'
                                                }`}
                                        >
                                            <div className="text-2xl mt-0.5">{personaConfig.emoji}</div>
                                            <div className="flex-1">
                                                <div className={`font-bold text-sm flex items-center gap-2 ${isActive ? 'text-chef-900' : 'text-stone-700'}`}>
                                                    {isZh ? personaConfig.name.zh : personaConfig.name.en}
                                                    {isActive && <CheckCircle size={14} className="text-chef-500" />}
                                                </div>
                                                <div className={`text-xs mt-0.5 ${isActive ? 'text-chef-700' : 'text-stone-500'}`}>
                                                    {isZh ? personaConfig.description.zh : personaConfig.description.en}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* API SETTINGS */}
                {activeTab === 'api' && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Text API */}
                        <PresetSection
                            type="text"
                            title={isZh ? '📝 文字生成 API' : '📝 Text Generation API'}
                            icon={<Cpu size={18} />}
                            presets={config.textPresets}
                            activePresetId={config.activeTextPresetId || config.textPresets[0]?.id || ''}
                            onSelectPreset={(id) => handleSelectPreset('text', id)}
                            onAddPreset={() => handleAddPreset('text')}
                            onDeletePreset={(id) => handleDeletePreset('text', id)}
                            onRenamePreset={(id, name) => handleRenamePreset('text', id, name)}
                            onUpdatePreset={(id, field, value) => handleUpdatePreset('text', id, field, value)}
                            isZh={isZh}
                        />

                        {/* Image API */}
                        <PresetSection
                            type="image"
                            title={isZh ? '🖼️ 图片生成 API' : '🖼️ Image Generation API'}
                            icon={<Image size={18} />}
                            presets={config.imagePresets}
                            activePresetId={config.activeImagePresetId || config.imagePresets[0]?.id || ''}
                            onSelectPreset={(id) => handleSelectPreset('image', id)}
                            onAddPreset={() => handleAddPreset('image')}
                            onDeletePreset={(id) => handleDeletePreset('image', id)}
                            onRenamePreset={(id, name) => handleRenamePreset('image', id, name)}
                            onUpdatePreset={(id, field, value) => handleUpdatePreset('image', id, field, value)}
                            isZh={isZh}
                        />

                        {/* Test & Status */}
                        <div className="flex items-center justify-between">
                            <GameButton
                                onClick={handleTest}
                                variant="secondary"
                                size="sm"
                                disabled={testStatus === 'testing'}
                            >
                                {testStatus === 'testing' ? (isZh ? '测试中...' : 'Testing...') : (isZh ? '测试连接' : 'Test Connection')}
                            </GameButton>

                            {testStatus === 'success' && (
                                <div className="flex items-center gap-1 text-green-600 text-sm">
                                    <CheckCircle size={16} />
                                    {isZh ? '连接成功' : 'Connected'}
                                </div>
                            )}
                            {testStatus === 'error' && (
                                <div className="flex items-center gap-1 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    {isZh ? '连接失败' : 'Failed'}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Close Button */}
                <GameButton onClick={onClose} variant="primary" className="w-full">
                    {isZh ? '完成' : 'Done'}
                </GameButton>
            </div>
        </Modal>
    );
};
