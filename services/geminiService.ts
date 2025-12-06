// AI Service - Uses settings from apiSettings to make API calls

import { KitchenItem, PrepMethod, HeatMethod, MixMethod, DishResult, Customer, Language, CookingPrecision, AnyCookingMethod, JudgePersona } from '../types';
import { INGREDIENTS, SEASONINGS, JUDGE_PERSONAS } from '../constants';
import { apiSettings } from './apiSettings';

// All valid IDs for checking
const ALL_INGREDIENTS = [...INGREDIENTS, ...SEASONINGS];
const VALID_IDS = ALL_INGREDIENTS.map(i => i.id);

// Build detailed image prompt with all ingredient attributes
const buildImagePrompt = (
  items: KitchenItem[],
  method: AnyCookingMethod | null,
  precision: CookingPrecision | undefined,
  isBartending: boolean,
  score: number
): string => {
  // Count ingredients and group by type with full details
  const ingredientCounts = new Map<string, { count: number; statuses: string[]; merged: boolean }>();

  items.forEach(item => {
    // Use statuses array if available, otherwise fall back to single status
    const statusList = item.statuses || [item.status || 'raw'];
    const key = `${statusList.join('_')}_${item.name}_${item.isMerged ? 'merged' : 'single'}`;
    const existing = ingredientCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      ingredientCounts.set(key, {
        count: 1,
        statuses: statusList,
        merged: !!item.isMerged
      });
    }
  });

  // Build detailed ingredient descriptions with counts
  const ingredientList: string[] = [];
  items.forEach(item => {
    const statusList = item.statuses || [item.status || 'raw'];
    const nonRawStatuses = statusList.filter(s => s !== 'raw');

    let desc = '';

    // Add processing state FIRST and prominently
    if (nonRawStatuses.length > 0) {
      desc += nonRawStatuses.map(s => s.toUpperCase()).join(' ') + ' ';
    }

    // Use the correct name (nameZh or name)
    desc += item.name;

    // Add merged info
    if (item.isMerged && item.mergedFrom) {
      desc += ` (mixture of: ${item.mergedFrom.join(' + ')})`;
    }

    ingredientList.push(desc);
  });

  const totalCount = items.length;
  const ingredientDesc = ingredientList.join('; ');

  // Collect all unique statuses for visual effects
  const allStatuses = new Set<string>();
  items.forEach(item => {
    const statusList = item.statuses || [item.status || 'raw'];
    statusList.forEach(s => allStatuses.add(s));
  });

  // Status effects descriptions
  const statusEffects: string[] = [];
  if (allStatuses.has('chopped') || allStatuses.has('sliced') || allStatuses.has('julienned')) {
    statusEffects.push('visible cut edges and knife marks');
  }
  if (allStatuses.has('ground')) {
    statusEffects.push('ground/minced texture, not whole pieces');
  }
  if (allStatuses.has('blended') || allStatuses.has('mashed')) {
    statusEffects.push('smooth pureed texture');
  }
  if (allStatuses.has('dried') || allStatuses.has('dehydrated')) {
    statusEffects.push('dried/dehydrated shriveled appearance');
  }
  if (allStatuses.has('marinated') || allStatuses.has('brined')) {
    statusEffects.push('glistening wet surface from marinade');
  }
  if (allStatuses.has('coated') || allStatuses.has('battered')) {
    statusEffects.push('outer coating or batter visible');
  }
  if (allStatuses.has('fried') || allStatuses.has('deep_fried') || allStatuses.has('stir_fried')) {
    statusEffects.push('golden-brown crispy fried surface');
  }
  if (allStatuses.has('steamed')) {
    statusEffects.push('soft steamed texture with moisture');
  }

  // Cooking method with visual details
  let cookingVisual = '';
  if (method === HeatMethod.BOIL) {
    cookingVisual = 'submerged in hot liquid/broth, steam rising, soft wet texture';
  } else if (method === HeatMethod.STEAM) {
    cookingVisual = 'gently steamed, moist and tender, light steam visible';
  } else if (method === HeatMethod.BRAISE) {
    cookingVisual = 'slow-cooked in rich sauce, caramelized edges, tender meat';
  } else if (method === HeatMethod.FRY || method === HeatMethod.STIR_FRY) {
    cookingVisual = 'glistening with oil, golden-brown crispy surface, seared edges';
  } else if (method === HeatMethod.DEEP_FRY) {
    cookingVisual = 'deep-fried golden crispy exterior, puffy texture';
  } else if (method === HeatMethod.BAKE || method === HeatMethod.GRILL) {
    cookingVisual = 'dry roasted surface, golden-brown color, slight charring on edges';
  } else if (method === MixMethod.SHAKE) {
    cookingVisual = 'mixed in cocktail glass, foam layer on top, condensation on glass';
  } else if (method === MixMethod.STIR) {
    cookingVisual = 'clear mixed liquid in glass, ice cubes floating, stirred appearance';
  } else if (method === MixMethod.BUILD) {
    cookingVisual = 'layered in tall glass, distinct color layers, ice visible';
  } else {
    cookingVisual = 'raw unprocessed state, natural fresh appearance';
  }

  // Precision effects
  let precisionVisual = '';
  if (precision === 'burnt') {
    precisionVisual = 'HEAVILY BURNT: black charred areas, smoke damage visible, overcooked and dry';
  } else if (precision === 'undercooked') {
    precisionVisual = 'UNDERCOOKED: pale color, raw pink center visible, watery appearance';
  } else if (precision === 'perfect') {
    precisionVisual = 'perfectly cooked, ideal golden color, juicy appealing look';
  }

  // Plating based on score
  let plating = '';
  if (score < 35) {
    plating = 'messy chaotic plating, ingredients scattered, unappealing presentation';
  } else if (score < 75) {
    plating = 'casual home-style arrangement, simple but recognizable';
  } else {
    plating = 'elegant professional plating, artistic arrangement, appetizing presentation';
  }

  const container = isBartending
    ? 'cocktail glass on bar counter, dark background'
    : 'white ceramic plate on wooden table, neutral background';

  return `Minimalist food photo on ${container}. NO TEXT.

THE DISH CONTAINS EXACTLY THESE ${totalCount} ITEMS (nothing else):
${ingredientDesc}

VISUAL EFFECTS:
- Cooking: ${cookingVisual}
${precisionVisual ? `- Result: ${precisionVisual}\n` : ''}- Preparation: ${statusEffects.length > 0 ? statusEffects.join(', ') : 'natural state'}
- Plating: ${plating}

CAMERA: 45° overhead, close-up, blurred background

ABSOLUTE RESTRICTIONS:
- ONLY show the ${totalCount} ingredients listed above
- NO vegetables, herbs, garnishes unless listed
- NO background ingredients or decorations
- NO onions, garlic, peppers unless explicitly listed
- NO text, watermarks, labels
- Clean simple composition
- Only the exact ingredients, nothing added`;
};



// Generic API call that supports both Gemini and OpenAI formats
async function callTextAPI(prompt: string): Promise<string> {
  const settings = apiSettings.get();

  console.log('[API] Current settings:', {
    textEndpoint: settings.textApiEndpoint,
    textModel: settings.textModel,
    hasTextKey: !!settings.textApiKey
  });

  if (!settings.textApiKey) {
    throw new Error('Text API key not configured. Please set it in API Settings.');
  }

  const isGemini = settings.textApiEndpoint.includes('generativelanguage.googleapis.com');

  console.log('[API] Using', isGemini ? 'Gemini' : 'OpenAI-compatible', 'format');

  if (isGemini) {
    // Gemini API format
    const url = `${settings.textApiEndpoint}/models/${settings.textModel}:generateContent?key=${settings.textApiKey}`;
    console.log('[API] Calling Gemini:', url.replace(settings.textApiKey, '***'));

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('[API] Response status:', response.status);

    if (!response.ok) {
      console.error('[API] Gemini error response:', responseText.substring(0, 500));
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Check if response is HTML (error page)
    if (responseText.startsWith('<!') || responseText.startsWith('<html')) {
      console.error('[API] Received HTML instead of JSON');
      throw new Error('API returned HTML error page. Please check your endpoint configuration.');
    }

    try {
      const data = JSON.parse(responseText);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      console.error('[API] Failed to parse response:', responseText.substring(0, 200));
      throw new Error('Failed to parse API response');
    }
  } else {
    // OpenAI-compatible API format
    let baseEndpoint = settings.textApiEndpoint.replace(/\/$/, '');

    // 如果endpoint已经包含 /chat/completions，直接使用
    let url: string;
    if (baseEndpoint.endsWith('/chat/completions')) {
      url = baseEndpoint;
      console.log('[API] Endpoint already has /chat/completions');
    } else {
      // Auto-add /v1 if not present (most OpenAI-compatible APIs need this)
      if (!baseEndpoint.endsWith('/v1') && !baseEndpoint.includes('/v1/')) {
        baseEndpoint = `${baseEndpoint}/v1`;
        console.log('[API] Auto-added /v1 to endpoint');
      }
      url = `${baseEndpoint}/chat/completions`;
    }
    console.log('[API] Calling OpenAI-compatible:', url);

    const body = {
      model: settings.textModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.textApiKey}`
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('[API] Response status:', response.status);
    console.log('[API] Response preview:', responseText.substring(0, 300));

    if (!response.ok) {
      console.error('[API] OpenAI error response:', responseText.substring(0, 500));
      throw new Error(`API error: ${response.status} - ${responseText.substring(0, 100)}`);
    }

    // Check if response is HTML (error page)
    if (responseText.startsWith('<!') || responseText.startsWith('<html') || responseText.startsWith('<HTML')) {
      console.error('[API] Received HTML instead of JSON. Full response:', responseText.substring(0, 500));
      throw new Error('API returned HTML. Try adding /v1 to your endpoint (e.g., https://api.xxx.com/v1)');
    }

    try {
      const data = JSON.parse(responseText);
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      console.error('[API] Failed to parse response:', responseText.substring(0, 300));
      throw new Error('Failed to parse API response: ' + responseText.substring(0, 50));
    }
  }
}

async function callImageAPI(prompt: string): Promise<string | null> {
  const settings = apiSettings.get();

  console.log('[IMAGE API] Starting image generation...');
  console.log('[IMAGE API] Settings:', {
    imageEndpoint: settings.imageApiEndpoint,
    imageModel: settings.imageModel,
    hasImageKey: !!settings.imageApiKey,
    hasTextKey: !!settings.textApiKey
  });

  // Use text API key if image key not set separately
  const imageKey = settings.imageApiKey || settings.textApiKey;

  if (!imageKey) {
    console.error('[IMAGE API] ❌ No API key configured for image generation!');
    return null;
  }

  // Determine API format based on endpoint and model name
  const endpoint = settings.imageApiEndpoint.toLowerCase();
  const model = settings.imageModel.toLowerCase();

  // Check if endpoint already contains full path (e.g., GLM, SiliconFlow)
  const hasFullImagePath = endpoint.includes('/images/generations');

  // Gemini detection
  const isGeminiEndpoint = endpoint.includes('generativelanguage.googleapis.com');
  const isGeminiModel = model.includes('gemini');

  // Replicate detection - only if NOT using a complete image generation endpoint
  const isFluxModel = model.includes('flux');
  const isReplicateEndpoint = endpoint.includes('/replicate/');

  // Priority: Full path endpoint > Gemini > Replicate > Default OpenAI
  const useGeminiFormat = (isGeminiEndpoint || isGeminiModel) && !hasFullImagePath;
  const useReplicateFormat = (isFluxModel || isReplicateEndpoint) && !hasFullImagePath && !useGeminiFormat;

  console.log('[IMAGE API] Model:', settings.imageModel);
  console.log('[IMAGE API] Format: hasFullPath:', hasFullImagePath, '| Gemini:', useGeminiFormat, '| Replicate:', useReplicateFormat);

  try {
    if (useGeminiFormat) {
      // Gemini format - works with googleapis.com and third-party proxies
      let baseEndpoint = settings.imageApiEndpoint.replace(/\/$/, '');

      if (!isGeminiEndpoint && !baseEndpoint.includes('/v1beta')) {
        baseEndpoint = `${baseEndpoint}/v1beta`;
      }

      const url = `${baseEndpoint}/models/${settings.imageModel}:generateContent?key=${imageKey}`;
      console.log('[IMAGE API] Calling Gemini format:', url.replace(imageKey, '***'));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT']
          }
        })
      });

      console.log('[IMAGE API] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IMAGE API] ❌ Gemini format error:', response.status, errorText.substring(0, 300));
        return null;
      }

      const data = await response.json();
      const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (imagePart?.inlineData) {
        console.log('[IMAGE API] ✅ Got Gemini image!');
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      console.warn('[IMAGE API] ⚠️ No image data in Gemini response');
      return null;

    } else if (useReplicateFormat) {
      // Replicate format for FLUX and similar models (ASYNC API)
      // Step 1: Create prediction task
      let baseEndpoint = settings.imageApiEndpoint.replace(/\/$/, '');
      const createUrl = `${baseEndpoint}/replicate/v1/models/${settings.imageModel}/predictions`;
      console.log('[IMAGE API] Creating Replicate prediction:', createUrl);

      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${imageKey}`
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            num_outputs: 1,
            aspect_ratio: "4:3",
            output_format: "png"
          }
        })
      });

      console.log('[IMAGE API] Create response status:', createResponse.status);

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('[IMAGE API] ❌ Replicate create error:', createResponse.status, errorText.substring(0, 300));
        return null;
      }

      const createData = await createResponse.json();
      console.log('[IMAGE API] Prediction created:', createData.id, 'status:', createData.status);

      // If output is immediately available (synchronous mode)
      if (createData.output && Array.isArray(createData.output) && createData.output.length > 0) {
        console.log('[IMAGE API] ✅ Got immediate output!');
        return createData.output[0];
      }

      // Step 2: Poll for completion (async mode)
      const predictionId = createData.id;
      if (!predictionId) {
        console.error('[IMAGE API] ❌ No prediction ID returned');
        return null;
      }

      const pollUrl = `${baseEndpoint}/replicate/v1/predictions/${predictionId}`;
      console.log('[IMAGE API] Polling for result:', pollUrl);

      // Poll up to 30 times (about 30 seconds)
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const pollResponse = await fetch(pollUrl, {
          headers: {
            'Authorization': `Bearer ${imageKey}`
          }
        });

        if (!pollResponse.ok) {
          console.error('[IMAGE API] ❌ Poll error:', pollResponse.status);
          continue;
        }

        const pollData = await pollResponse.json();
        console.log('[IMAGE API] Poll', i + 1, '- status:', pollData.status);

        if (pollData.status === 'succeeded' && pollData.output) {
          const output = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
          console.log('[IMAGE API] ✅ Got Replicate image!');
          return output;
        }

        if (pollData.status === 'failed' || pollData.status === 'canceled') {
          console.error('[IMAGE API] ❌ Prediction failed:', pollData.error);
          return null;
        }

        // Still processing, continue polling
      }

      console.warn('[IMAGE API] ⚠️ Polling timeout after 30 seconds');
      return null;


    } else {
      // OpenAI-compatible format (DALL-E style)
      let baseEndpoint = settings.imageApiEndpoint.replace(/\/$/, '');
      let url: string;

      // Check if endpoint already includes the full path
      if (baseEndpoint.includes('/images/generations')) {
        // Endpoint is already complete (e.g., GLM/CogView)
        url = baseEndpoint;
        console.log('[IMAGE API] Using complete endpoint:', url);
      } else {
        // Standard OpenAI format - need to add path
        if (!baseEndpoint.endsWith('/v1') && !baseEndpoint.includes('/v1/')) {
          baseEndpoint = `${baseEndpoint}/v1`;
        }
        url = `${baseEndpoint}/images/generations`;
        console.log('[IMAGE API] Calling OpenAI format:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${imageKey}`
        },
        body: JSON.stringify({
          model: settings.imageModel,
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        })
      });

      console.log('[IMAGE API] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IMAGE API] ❌ OpenAI format error:', response.status, errorText.substring(0, 300));
        return null;
      }

      const data = await response.json();
      console.log('[IMAGE API] Response data:', JSON.stringify(data).substring(0, 500));

      // Standard OpenAI format: data[0].b64_json
      const b64 = data.data?.[0]?.b64_json;
      if (b64) {
        console.log('[IMAGE API] ✅ Got base64 image!');
        return `data:image/png;base64,${b64}`;
      }

      // Standard OpenAI format: data[0].url
      const imageUrl = data.data?.[0]?.url;
      if (imageUrl) {
        console.log('[IMAGE API] ✅ Got image URL from data array!');
        return imageUrl;
      }

      // ModelScope format: output.result_image or output.image
      if (data.output?.result_image) {
        console.log('[IMAGE API] ✅ Got ModelScope result_image!');
        return data.output.result_image;
      }
      if (data.output?.image) {
        console.log('[IMAGE API] ✅ Got ModelScope image!');
        return data.output.image;
      }

      // Direct image/url in response
      if (data.image) {
        console.log('[IMAGE API] ✅ Got direct image!');
        return data.image;
      }
      if (data.url) {
        console.log('[IMAGE API] ✅ Got direct url!');
        return data.url;
      }

      // Images array format (ModelScope, etc.)
      if (data.images?.[0]) {
        const img = data.images[0];
        // Could be string or object with url
        const imgUrl = typeof img === 'string' ? img : img.url;
        if (imgUrl) {
          console.log('[IMAGE API] ✅ Got images array!');
          return imgUrl;
        }
      }

      // Result format
      if (data.result?.image) {
        console.log('[IMAGE API] ✅ Got result.image!');
        return data.result.image;
      }

      console.warn('[IMAGE API] ⚠️ No image in response. Keys:', Object.keys(data));
      return null;
    }
  } catch (error) {
    console.error('[IMAGE API] ❌ Image generation failed:', error);
    return null;
  }
}

export const generateCustomer = async (lang: Language, template?: Customer): Promise<Customer> => {
  const isZh = lang === 'zh';
  const languageInstruction = isZh ? "用简体中文回复。" : "Respond in English.";

  const exclusiveRule = "【重要】请求必须是食物或饮料之一，不能两者都要。";

  // 随机多样性元素
  const speakingStyles = isZh
    ? ['礼貌正式', '直接干脆', '啰嗦絮叨', '傲慢挑剔', '温柔害羞', '热情爽朗', '冷淡疏离', '幽默搞笑', '抱怨吐槽', '神秘高冷']
    : ['polite formal', 'direct blunt', 'rambling verbose', 'arrogant picky', 'shy gentle', 'enthusiastic cheerful', 'cold distant', 'humorous joking', 'complaining', 'mysterious cool'];

  const moods = isZh
    ? ['开心愉悦', '饥肠辘辘', '心情烦躁', '疲惫困倦', '兴奋期待', '无聊发呆', '着急赶时间', '悠闲放松', '伤心难过', '好奇探索']
    : ['happy joyful', 'starving hungry', 'irritated annoyed', 'tired sleepy', 'excited anticipating', 'bored', 'rushed hurried', 'relaxed leisurely', 'sad melancholy', 'curious exploring'];

  const scenarios = isZh
    ? ['下班后犒劳自己', '和朋友聚餐', '约会中', '加班到很晚', '健身后补充能量', '减肥中忍不住', '庆祝生日/升职', '宿醉需要解酒', '失恋借吃消愁', '旅游中尝鲜', '带孩子来吃饭', '商务宴请', '深夜饿醒了', '考试周压力大']
    : ['treating self after work', 'dining with friends', 'on a date', 'working late overtime', 'post-workout refuel', 'on diet but craving', 'celebrating birthday/promotion', 'hungover need remedy', 'heartbroken eating feelings', 'traveling trying local food', 'bringing kids to eat', 'business dinner', 'midnight hunger', 'exam week stress eating'];

  const characterTypes = isZh
    ? ['上班族', '学生党', '退休老人', '健身达人', '吃货博主', '挑食小孩', '孕妇', '外卖骑手', '网红直播', '厨师同行', '营养师', '大胃王挑战者', '素食主义者', '肉食爱好者', '甜品控', '无辣不欢', '过敏体质', '减肥中', '暴走一天的游客']
    : ['office worker', 'student', 'retired elder', 'fitness enthusiast', 'food blogger', 'picky child', 'pregnant woman', 'delivery driver', 'live streamer', 'fellow chef', 'nutritionist', 'competitive eater', 'vegetarian', 'meat lover', 'dessert addict', 'spice fanatic', 'allergy sufferer', 'on strict diet', 'exhausted tourist'];

  // 随机选择多样性元素
  const randomStyle = speakingStyles[Math.floor(Math.random() * speakingStyles.length)];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const randomType = characterTypes[Math.floor(Math.random() * characterTypes.length)];

  let prompt = "";

  if (template) {
    const name = isZh ? (template.nameZh || template.name) : template.name;
    const trait = isZh ? (template.traitZh || template.trait) : template.trait;

    prompt = `你是一个餐厅顾客角色扮演AI。
${languageInstruction}

角色: ${name} (${trait})
当前情绪: ${randomMood}
说话风格: ${randomStyle}
场景: ${randomScenario}

用第一人称生成一个符合角色性格的点餐请求。
- 请求要具体、接地气，不要使用抽象诗意的描述
- 说话方式要体现${randomStyle}的风格
- 要反映出${randomMood}的情绪
- 场景是${randomScenario}

${exclusiveRule}
从以下食材ID中选择3-5个: ${VALID_IDS.slice(0, 30).join(', ')}

只返回JSON: {"request": "具体的点餐请求", "suggestedIngredients": ["id1", "id2"]}`;
  } else {
    prompt = `为烹饪游戏生成一个独特的餐厅顾客角色。
${languageInstruction}

【本次生成的随机参数】(必须体现在角色中)
- 角色类型: ${randomType}
- 说话风格: ${randomStyle}  
- 当前情绪: ${randomMood}
- 来店场景: ${randomScenario}

【禁止事项】
- 不要使用抽象名字如"星辰"、"月光"
- 不要使用谜语式的请求
- 必须是具体的、接地气的表达

【生成要求】
- name: 符合${randomType}身份的具体名字(如"程序员小李"、"健身教练阿强")
- emoji: 匹配角色情绪的表情
- trait: 一个明确特点，要体现${randomMood}或${randomStyle}
- request: 用第一人称、${randomStyle}的语气说具体点餐请求
  场景是${randomScenario}，要自然融入对话中
  不要笼统说"来点xx"，要有具体食材偏好

${exclusiveRule}
可用食材ID: ${VALID_IDS.slice(0, 40).join(', ')}

只返回JSON: {"name": "...", "emoji": "...", "trait": "...", "request": "...", "suggestedIngredients": ["id1", "id2"]}`;
  }

  try {
    const text = await callTextAPI(prompt);
    if (!text) throw new Error("No response");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const data = JSON.parse(jsonMatch[0]);

    let totalCost = 0;
    const suggestedIds = data.suggestedIngredients || [];

    suggestedIds.forEach((id: string) => {
      const item = ALL_INGREDIENTS.find(i => i.id === id);
      if (item) totalCost += item.price;
    });

    if (totalCost === 0) totalCost = 30;
    const budget = Math.round(totalCost * 1.5);

    if (template) {
      return { ...template, request: data.request, requestZh: undefined, suggestedIngredients: suggestedIds, budget };
    } else {
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name || 'Customer',
        emoji: data.emoji || '🙂',
        trait: data.trait || 'Hungry',
        request: data.request || 'Something tasty please',
        budget,
        suggestedIngredients: suggestedIds
      };
    }
  } catch (error) {
    console.error("[API] Failed to generate customer:", error);
    if (template) return template;

    return {
      id: 'fallback',
      name: isZh ? '饥饿的访客' : 'Hungry Visitor',
      emoji: '🙂',
      trait: isZh ? '急躁' : 'Impatient',
      request: isZh ? '随便做点能吃的就行。' : 'Just make me something edible.',
      budget: 50,
      suggestedIngredients: ['bread', 'cheese']
    };
  }
};



export const cookDish = async (
  items: KitchenItem[],
  method: AnyCookingMethod | null,
  customer: Customer | null,
  lang: Language,
  precision: CookingPrecision = 'perfect',
  judgePersona: JudgePersona = 'standard'
): Promise<DishResult> => {
  // 构建完整的食材描述，包含所有加工历史
  const itemList = items.map(i => {
    let desc = i.name;

    // 从 processHistory 获取所有加工步骤
    if (i.processHistory && i.processHistory.length > 0) {
      const steps = i.processHistory.map(step => step.method).join(' → ');
      desc = `${i.name} (${steps})`;
    } else if (i.statuses && i.statuses.length > 0) {
      // 备用：使用 statuses 数组
      const nonRawStatuses = i.statuses.filter(s => s !== 'raw');
      if (nonRawStatuses.length > 0) {
        desc = `${nonRawStatuses.join(' → ')} ${i.name}`;
      }
    } else if (i.status && i.status !== 'raw') {
      desc = `${i.status.toUpperCase()} ${i.name}`;
    }

    // 添加腌制信息
    if (i.marinadeLabels && i.marinadeLabels.length > 0) {
      desc += ` [marinated with: ${i.marinadeLabels.join(', ')}]`;
    }

    // 如果是合并的混合物
    if (i.isMerged && i.mergedFrom) {
      desc = `Mixture of (${i.mergedFrom.join(' + ')}) processed: ${desc}`;
    }

    return desc;
  }).join('; ');

  const isZh = lang === 'zh';
  const languageInstruction = isZh ? "OUTPUT IN SIMPLIFIED CHINESE." : "OUTPUT IN ENGLISH.";

  const isBartending = method === MixMethod.SHAKE || method === MixMethod.STIR || method === MixMethod.BUILD;

  // QTE 评分处理
  const processSteps = items.flatMap(i => i.processHistory || []);
  let qtePerformanceDesc = "";
  let lowestRating = 'perfect'; // 追踪最差评级

  if (processSteps.length > 0) {
    qtePerformanceDesc = processSteps.map((step, idx) => {
      const rating = step.qteRating || 'unknown';
      if (rating === 'failed') lowestRating = 'failed';
      if (rating === 'poor' && lowestRating !== 'failed') lowestRating = 'poor';
      return `- Step ${idx + 1} ${step.method}: ${rating.toUpperCase()}`;
    }).join('\n');
  }

  let precisionText = precision === 'burnt'
    ? "BURNT - charred, score max 40"
    : precision === 'undercooked'
      ? "UNDERCOOKED - raw inside, score max 30 for meat"
      : "PERFECT execution";

  // 如果 QTE 表现很差，覆盖 precision 描述
  if (lowestRating === 'failed') {
    precisionText = "FAILED COOKING - Terrible execution, timing missed completely. Result should be barely edible.";
  } else if (lowestRating === 'poor') {
    precisionText = "POOR COOKING - Bad timing, unevenly cooked.";
  } else if (qtePerformanceDesc) {
    precisionText += `\nPerformance Details:\n${qtePerformanceDesc}`;
  }

  const ingredientList = items.map(i => ({
    name: isZh ? (i.nameZh || i.name) : i.name,
    emoji: i.emoji,
    status: i.status !== 'raw' ? i.status : undefined,
    marinade: i.marinadeLabels?.join(', ')
  }));

  // 评审风格Prompt
  const judgeConfig = JUDGE_PERSONAS[judgePersona] || JUDGE_PERSONAS.standard;
  const personaInstruction = judgeConfig.promptInstruction[lang === 'zh' ? 'zh' : 'en'];

  const textPrompt = `${personaInstruction}
${isBartending ? (lang === 'zh' ? '你正在评价一杯饮品。' : 'You are critiquing a drink.') : ''}

【食材清单】(只有这些，不能添加任何其他食材)
${itemList}

【烹饪信息】
- 最终烹饪方法: ${method || '生食/未烹饪'}
- 烹饪火候/执行质量: ${precisionText}

${customer ? `【顾客信息】
- 顾客: ${customer.name} (${customer.trait})
- 点餐: "${customer.request}"` : '【自由烹饪模式】'}

【严格评分标准】(请认真遵守)
- 0-20分：完全失败 (食材搭配荒谬、做法严重错误、无法食用)
- 21-40分：差评 (搭配不合理、烹饪方法不当、味道糟糕)
- 41-55分：勉强及格 (一般般，没什么亮点)
- 56-70分：良好 (搭配合理，烹饪得当)
- 71-85分：优秀 (搭配巧妙，烹饪完美，有创意)
- 86-100分：大师级 (极罕见，只有顶级搭配+完美烹饪才配得上)

【扣分项】(每项扣5-15分)
- 食材搭配不合理 (如：巧克力配鱼)
- 烹饪方法不适合该食材 (如：生吃鸡肉)
- 与顾客要求不符
- 缺少基本调味 (如：没有盐)
- 处理步骤没有意义或矛盾

【加分项】(每项加5-10分)
- 食材搭配经典或创新
- 烹饪方法恰当
- 满足顾客特殊要求
- 有合理的调味

【重要约束 - 必须严格遵守】
- 【!!!禁止幻觉!!!】你只能描述【食材清单】中列出的食材，禁止提及任何其他食材
- 如果清单中只有"鸡蛋、五花肉"，描述中绝对不能出现"黄瓜"或任何其他食材
- 菜名必须根据实际食材命名，不能含有未使用的食材名称
- 描述必须提及所有处理步骤
- 如果食材搭配很糟糕，给低分不要客气
- 评价要诚实，不要无脑夸

${isZh ? '用简体中文输出。' : 'Output in English.'}
再次强调：只能使用以下食材: ${items.map(i => isZh ? (i.nameZh || i.name) : i.name).join('、')}

只返回JSON: {"dishName": "根据实际使用食材起的名字", "description": "只描述实际使用的食材", "emoji": "🍽️", "score": 50, "chefComment": "诚实的厨师点评", "customerFeedback": "顾客反馈", "customerSatisfied": false, "colorHex": "#abc123"}`;

  try {
    const textResponse = await callTextAPI(textPrompt);
    if (!textResponse) throw new Error("No response from AI");

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[API] No JSON found in response:', textResponse.substring(0, 200));
      throw new Error("No JSON in response");
    }

    const resultJson = JSON.parse(jsonMatch[0]) as DishResult;

    // Image Generation - use new detailed prompt builder
    const imagePrompt = buildImagePrompt(items, method, precision, isBartending, resultJson.score);

    let imageUrl = await callImageAPI(imagePrompt);

    // 如果图片是 URL（非 base64），立即转换为 Base64 以确保持久化
    if (imageUrl && !imageUrl.startsWith('data:')) {
      try {
        console.log('[IMAGE] Converting URL to Base64 for persistence...');
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // 使用 FileReader 转换为 Base64
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            console.log('[IMAGE] ✅ Converted to Base64, length:', base64.length);
            resolve(base64);
          };
          reader.onerror = () => {
            console.warn('[IMAGE] ⚠️ Base64 conversion failed, using original URL');
            resolve(imageUrl!);
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('[IMAGE] ⚠️ Failed to fetch image for Base64 conversion:', e);
        // 保留原 URL 作为后备
      }
    }

    return {
      ...resultJson,
      imageUrl: imageUrl || undefined,
      customerName: customer?.name,
      customerEmoji: customer?.emoji,
      ingredients: ingredientList,
      cookingPrecision: precision
    };

  } catch (error) {
    console.error("[API] Cooking failed:", error);
    return {
      dishName: isZh ? "厨房错误" : "Kitchen Error",
      description: isZh ? "API 调用失败，请检查 API 设置。" : "API call failed. Check API settings.",
      emoji: "💥",
      score: 0,
      chefComment: String(error),
      colorHex: "#57534e",
      customerFeedback: "...",
      customerSatisfied: false,
      ingredients: []
    };
  }
};
