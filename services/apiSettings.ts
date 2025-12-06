// API Settings Service - Manages multiple API presets for text and image generation

export interface ApiPreset {
    id: string;
    name: string;        // 用户自定义名称
    endpoint: string;
    apiKey: string;
    model: string;
}

export interface ApiConfigStore {
    textPresets: ApiPreset[];     // 文字生成预设列表
    imagePresets: ApiPreset[];    // 图片生成预设列表
    activeTextPresetId: string;   // 当前选中的文字预设ID
    activeImagePresetId: string;  // 当前选中的图片预设ID
}

// 向后兼容的接口（供 geminiService 使用）
export interface ApiSettings {
    textApiEndpoint: string;
    textApiKey: string;
    textModel: string;
    imageApiEndpoint: string;
    imageApiKey: string;
    imageModel: string;
    useSameKey: boolean;
}

const API_CONFIG_KEY = 'ai-pocket-kitchen-api-config-v2';

// 创建默认预设
const createDefaultPreset = (type: 'text' | 'image'): ApiPreset => ({
    id: `default-${type}-${Date.now()}`,
    name: type === 'text' ? '默认文字API' : '默认图片API',
    endpoint: '',
    apiKey: '',
    model: ''
});

const defaultConfig: ApiConfigStore = {
    textPresets: [createDefaultPreset('text')],
    imagePresets: [createDefaultPreset('image')],
    activeTextPresetId: '',
    activeImagePresetId: ''
};

// 尝试从旧格式迁移
const migrateFromOldFormat = (): ApiConfigStore | null => {
    try {
        const oldData = localStorage.getItem('ai-pocket-kitchen-api-settings');
        if (oldData) {
            const old = JSON.parse(oldData);
            const textPreset: ApiPreset = {
                id: 'migrated-text',
                name: '迁移的文字配置',
                endpoint: old.textApiEndpoint || '',
                apiKey: old.textApiKey || '',
                model: old.textModel || ''
            };
            const imagePreset: ApiPreset = {
                id: 'migrated-image',
                name: '迁移的图片配置',
                endpoint: old.imageApiEndpoint || '',
                apiKey: old.imageApiKey || '',
                model: old.imageModel || ''
            };
            return {
                textPresets: [textPreset],
                imagePresets: [imagePreset],
                activeTextPresetId: textPreset.id,
                activeImagePresetId: imagePreset.id
            };
        }
    } catch (e) {
        console.warn('Migration failed:', e);
    }
    return null;
};

export const apiConfigStore = {
    // 获取完整配置
    getConfig(): ApiConfigStore {
        try {
            const saved = localStorage.getItem(API_CONFIG_KEY);
            if (saved) {
                const config = JSON.parse(saved) as ApiConfigStore;
                // 确保至少有一个预设
                if (config.textPresets.length === 0) {
                    config.textPresets = [createDefaultPreset('text')];
                }
                if (config.imagePresets.length === 0) {
                    config.imagePresets = [createDefaultPreset('image')];
                }
                return config;
            }
            // 尝试从旧格式迁移
            const migrated = migrateFromOldFormat();
            if (migrated) {
                this.saveConfig(migrated);
                return migrated;
            }
        } catch (e) {
            console.error('Failed to load API config:', e);
        }
        return { ...defaultConfig };
    },

    // 保存完整配置
    saveConfig(config: ApiConfigStore): void {
        try {
            localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
        } catch (e) {
            console.error('Failed to save API config:', e);
        }
    },

    // 获取当前激活的文字预设
    getActiveTextPreset(): ApiPreset | null {
        const config = this.getConfig();
        return config.textPresets.find(p => p.id === config.activeTextPresetId)
            || config.textPresets[0] || null;
    },

    // 获取当前激活的图片预设
    getActiveImagePreset(): ApiPreset | null {
        const config = this.getConfig();
        return config.imagePresets.find(p => p.id === config.activeImagePresetId)
            || config.imagePresets[0] || null;
    },

    // 设置激活的预设
    setActivePreset(type: 'text' | 'image', presetId: string): void {
        const config = this.getConfig();
        if (type === 'text') {
            config.activeTextPresetId = presetId;
        } else {
            config.activeImagePresetId = presetId;
        }
        this.saveConfig(config);
    },

    // 添加预设
    addPreset(type: 'text' | 'image', preset: Omit<ApiPreset, 'id'>): ApiPreset {
        const config = this.getConfig();
        const newPreset: ApiPreset = {
            ...preset,
            id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        if (type === 'text') {
            config.textPresets.push(newPreset);
            config.activeTextPresetId = newPreset.id;
        } else {
            config.imagePresets.push(newPreset);
            config.activeImagePresetId = newPreset.id;
        }
        this.saveConfig(config);
        return newPreset;
    },

    // 更新预设
    updatePreset(type: 'text' | 'image', presetId: string, updates: Partial<ApiPreset>): void {
        const config = this.getConfig();
        const presets = type === 'text' ? config.textPresets : config.imagePresets;
        const index = presets.findIndex(p => p.id === presetId);
        if (index !== -1) {
            presets[index] = { ...presets[index], ...updates, id: presetId };
            this.saveConfig(config);
        }
    },

    // 删除预设
    deletePreset(type: 'text' | 'image', presetId: string): boolean {
        const config = this.getConfig();
        const presets = type === 'text' ? config.textPresets : config.imagePresets;

        // 至少保留一个预设
        if (presets.length <= 1) {
            return false;
        }

        const index = presets.findIndex(p => p.id === presetId);
        if (index !== -1) {
            presets.splice(index, 1);
            // 如果删除的是当前激活的，切换到第一个
            const activeKey = type === 'text' ? 'activeTextPresetId' : 'activeImagePresetId';
            if (config[activeKey] === presetId) {
                config[activeKey] = presets[0]?.id || '';
            }
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // 检查是否有有效配置
    hasValidConfig(): boolean {
        const textPreset = this.getActiveTextPreset();
        const imagePreset = this.getActiveImagePreset();
        return !!(textPreset?.apiKey && imagePreset?.apiKey);
    }
};

// 向后兼容的 apiSettings 对象（供 geminiService 使用）
export const apiSettings = {
    get(): ApiSettings {
        const textPreset = apiConfigStore.getActiveTextPreset();
        const imagePreset = apiConfigStore.getActiveImagePreset();
        return {
            textApiEndpoint: textPreset?.endpoint || '',
            textApiKey: textPreset?.apiKey || '',
            textModel: textPreset?.model || '',
            imageApiEndpoint: imagePreset?.endpoint || '',
            imageApiKey: imagePreset?.apiKey || '',
            imageModel: imagePreset?.model || '',
            useSameKey: false
        };
    },

    save(settings: Partial<ApiSettings>): void {
        // 更新当前激活的预设
        if (settings.textApiEndpoint !== undefined || settings.textApiKey !== undefined || settings.textModel !== undefined) {
            const textPreset = apiConfigStore.getActiveTextPreset();
            if (textPreset) {
                apiConfigStore.updatePreset('text', textPreset.id, {
                    endpoint: settings.textApiEndpoint ?? textPreset.endpoint,
                    apiKey: settings.textApiKey ?? textPreset.apiKey,
                    model: settings.textModel ?? textPreset.model
                });
            }
        }
        if (settings.imageApiEndpoint !== undefined || settings.imageApiKey !== undefined || settings.imageModel !== undefined) {
            const imagePreset = apiConfigStore.getActiveImagePreset();
            if (imagePreset) {
                apiConfigStore.updatePreset('image', imagePreset.id, {
                    endpoint: settings.imageApiEndpoint ?? imagePreset.endpoint,
                    apiKey: settings.imageApiKey ?? imagePreset.apiKey,
                    model: settings.imageModel ?? imagePreset.model
                });
            }
        }
    },

    reset(): void {
        localStorage.removeItem(API_CONFIG_KEY);
    },

    hasValidConfig(): boolean {
        return apiConfigStore.hasValidConfig();
    }
};

// Helper to make OpenAI-compatible API calls (保持原有接口)
export async function callTextApi(
    messages: { role: string; content: string }[],
    options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
    const settings = apiSettings.get();

    if (!settings.textApiKey) {
        throw new Error('Text API key not configured');
    }

    const isGemini = settings.textApiEndpoint.includes('generativelanguage.googleapis.com');

    if (isGemini) {
        const response = await fetch(
            `${settings.textApiEndpoint}/models/${settings.textModel}:generateContent?key=${settings.textApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
        const response = await fetch(`${settings.textApiEndpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.textApiKey}`
            },
            body: JSON.stringify({
                model: settings.textModel,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.max_tokens ?? 2048
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
}

export async function callImageApi(prompt: string): Promise<string | null> {
    const settings = apiSettings.get();

    if (!settings.imageApiKey) {
        throw new Error('Image API key not configured');
    }

    const isGemini = settings.imageApiEndpoint.includes('generativelanguage.googleapis.com');

    if (isGemini) {
        const response = await fetch(
            `${settings.imageApiEndpoint}/models/${settings.imageModel}:generateContent?key=${settings.imageApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini Image API error: ${response.status}`);
        }

        const data = await response.json();
        const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        return null;
    } else {
        const response = await fetch(`${settings.imageApiEndpoint}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.imageApiKey}`
            },
            body: JSON.stringify({
                model: settings.imageModel,
                prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json'
            })
        });

        if (!response.ok) {
            throw new Error(`Image API error: ${response.status}`);
        }

        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
            return `data:image/png;base64,${b64}`;
        }
        return data.data?.[0]?.url || null;
    }
}
