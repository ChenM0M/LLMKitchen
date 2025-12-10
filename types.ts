
// ===== 基础类型 =====
export type Language = 'en' | 'zh';
export type Theme = 'default' | 'japanese';

// ===== 食材分类 =====
export type IngredientCategory =
  | 'protein'      // 蛋白质（肉类、海鲜、蛋）
  | 'vegetable'    // 蔬菜（含根茎类、叶菜、菌菇）
  | 'fruit'        // 水果
  | 'starch'       // 主食（米面、烘焙）
  | 'dairy'        // 乳制品
  | 'nuts'         // 坚果
  | 'beverage'     // 饮料（果汁、气泡）
  | 'alcohol'      // 酒类
  | 'seasoning';   // 调味料

export type IngredientSubCategory =
  // Protein
  | 'red_meat' | 'poultry' | 'seafood' | 'shellfish' | 'eggs' | 'premium_protein'
  // Vegetable
  | 'root' | 'leafy' | 'fruiting' | 'mushroom'
  // Fruit
  | 'berry' | 'citrus' | 'tropical' | 'stone_fruit'
  // Starch
  | 'grain' | 'pasta' | 'bread'
  // Dairy
  | 'milk_product' | 'cheese'
  // Beverage
  | 'juice' | 'soda' | 'tea_coffee'
  // Alcohol
  | 'spirit' | 'liqueur' | 'wine'
  // Seasoning
  | 'salt_sugar' | 'spice' | 'sauce' | 'oil' | 'herb';

export interface Ingredient {
  id: string;
  name: string;
  nameZh?: string;
  emoji: string;
  category: IngredientCategory;
  subCategory?: IngredientSubCategory;
  color: string;
  price: number;
}

// ===== 食材状态系统（支持多重叠加） =====
export type ItemStatus =
  // 备菜状态
  | 'raw'        // 生的
  | 'chopped'    // 切碎
  | 'sliced'     // 切片
  | 'julienned'  // 切丝
  | 'mashed'     // 捣碎
  | 'ground'     // 磨粉
  | 'blended'    // 搅拌混合
  | 'dried'      // 风干
  | 'dehydrated' // 脱水
  // 腌制状态
  | 'marinated'  // 腌制
  | 'brined'     // 浸泡
  | 'coated'     // 裹粉
  | 'battered'   // 上浆
  // 烹饪状态
  | 'boiled'     // 煮过
  | 'steamed'    // 蒸过
  | 'braised'    // 炖过
  | 'fried'      // 煎过
  | 'deep_fried' // 炸过
  | 'stir_fried' // 炒过
  | 'baked'      // 烤过
  | 'grilled'    // 烧烤过
  | 'microwaved' // 微波过
  // 调酒状态
  | 'shaken'     // 摇匀
  | 'stirred'    // 搅拌
  | 'layered'    // 分层
  | 'iced'       // 加冰
  | 'strained'   // 过滤
  // 结果状态
  | 'burnt'      // 烧焦
  | 'undercooked'; // 未熟

// ===== 加工方法枚举 =====
export enum PrepMethod {
  CHOP = 'CHOP',           // 切碎
  SLICE = 'SLICE',         // 切片
  JULIENNE = 'JULIENNE',   // 切丝
  MASH = 'MASH',           // 捣碎
  GRIND = 'GRIND',         // 磨粉
  BLEND = 'BLEND',         // 搅拌混合 (合并操作)
  AIR_DRY = 'AIR_DRY',     // 风干
  DEHYDRATE = 'DEHYDRATE', // 脱水
}

export enum MarinateMethod {
  MARINATE = 'MARINATE',   // 腌制
  BRINE = 'BRINE',         // 浸泡
  COAT = 'COAT',           // 裹粉
  BATTER = 'BATTER',       // 上浆
}

export enum HeatMethod {
  BOIL = 'BOIL',           // 煮
  STEAM = 'STEAM',         // 蒸
  BRAISE = 'BRAISE',       // 炖
  FRY = 'FRY',             // 煎
  DEEP_FRY = 'DEEP_FRY',   // 炸
  STIR_FRY = 'STIR_FRY',   // 炒
  BAKE = 'BAKE',           // 烘烤
  GRILL = 'GRILL',         // 烧烤
  MICROWAVE = 'MICROWAVE', // 微波
}

export enum MixMethod {
  SHAKE = 'SHAKE',         // 摇匀
  STIR = 'STIR',           // 搅拌
  BUILD = 'BUILD',         // 直调/分层
  ADD_ICE = 'ADD_ICE',     // 加冰
  STRAIN = 'STRAIN',       // 过滤
}

export type AnyCookingMethod = PrepMethod | MarinateMethod | HeatMethod | MixMethod;

// QTE 评级
export type QTERating = 'failed' | 'poor' | 'mediocre' | 'normal' | 'excellent' | 'perfect' | null;

// QTE 难度
export type QTEDifficulty = 'none' | 'easy' | 'normal' | 'hard';

// ===== 加工步骤记录 =====
export interface ProcessStep {
  method: AnyCookingMethod;
  timestamp: number;
  mode?: 'MERGE' | 'SEPARATE';  // 合并或分开处理
  seasonings?: string[];         // 该步骤使用的调料
  qteRating?: QTERating;         // 该步骤的 QTE 评级
}

// ===== 厨房物品（核心类型重构） =====
export interface KitchenItem extends Ingredient {
  instanceId: string;

  // 多重状态系统
  statuses: ItemStatus[];          // 叠加的状态列表
  processHistory: ProcessStep[];   // 加工历史（最多5步）

  // 腌制/调味信息
  marinadeLabels?: string[];

  // 合并信息
  isMerged?: boolean;              // 是否是合并产物
  mergedFrom?: string[];           // 合并来源的emoji列表
  mergedItemCount?: number;        // 合并了多少个食材

  // QTE 评级 (Legacy / Current Status)
  qteRating?: QTERating;              // 烹饪 QTE 小游戏评级

  // 兼容旧代码的 status 属性（取最后一个状态）
  status: ItemStatus;
}

// 最大加工步骤数
export const MAX_PROCESS_STEPS = 5;

// ===== 游戏模式 =====
export type GameMode = 'SANDBOX' | 'CHALLENGE';
// 评审风格
export type JudgePersona = 'standard' | 'gordon' | 'grandma' | 'scifi' | 'cat' | 'jk' | 'tieba' | 'loli' | 'girlfriend';

export type CookingPrecision = 'undercooked' | 'perfect' | 'burnt';

// ===== 顾客 =====
export interface Customer {
  id: string;
  name: string;
  nameZh?: string;
  emoji: string;
  request: string;
  requestZh?: string;
  trait: string;
  traitZh?: string;
  budget: number;
  suggestedIngredients?: string[];
}

// ===== 出盘结果 =====
export interface DishIngredient {
  name: string;
  emoji: string;
  statuses?: ItemStatus[];   // 改为多状态
  marinade?: string;
  processHistory?: ProcessStep[];
}

export interface DishResult {
  dishName: string;
  customName?: string;  // 用户自定义菜名
  description: string;
  emoji: string;
  score: number;
  chefComment: string;
  colorHex: string;
  imageUrl?: string;
  imagePrompt?: string;  // 图片生成提示词
  customerFeedback?: string;
  customerSatisfied?: boolean;
  customerName?: string;
  customerEmoji?: string;
  judgePersonaId?: string; // ID of the judge who critiqued this dish
  imageId?: string; // IndexedDB ID for persistent image storage
  ingredients?: DishIngredient[];

  // Financials
  cost?: number;
  revenue?: number;
  profit?: number;
  latePenalty?: number;

  // Precision metadata
  cookingPrecision?: CookingPrecision;
}

// ===== 工作台类型 =====
export type StationType = 'prep' | 'marinate' | 'cook' | 'bar' | 'submit';

// ===== 游戏状态 =====
export interface GameState {
  counterItems: KitchenItem[];     // 备菜台上的食材
  prepItems: KitchenItem[];        // 准备区食材
  potItems: KitchenItem[];         // 烹饪台食材
  barItems: KitchenItem[];         // 调酒台食材
  submitItems: KitchenItem[];      // 新增：出盘台食材
  isCooking: boolean;
  lastResult: DishResult | null;
  history: DishResult[];
  currentCustomer: Customer | null;
  money: number;
}

// ===== 工具函数类型 =====
// 创建新的 KitchenItem
export function createKitchenItem(ingredient: Ingredient): KitchenItem {
  return {
    ...ingredient,
    instanceId: `${ingredient.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    statuses: ['raw'],
    processHistory: [],
    status: 'raw',  // 兼容旧代码
    marinadeLabels: [],
  };
}

// 检查是否可以继续加工
export function canProcess(item: KitchenItem): boolean {
  // 兼容旧的 KitchenItem 对象没有 processHistory
  const historyLength = item.processHistory?.length ?? 0;
  return historyLength < MAX_PROCESS_STEPS;
}

// 获取加工限制提示
export function getProcessLimitMessage(lang: Language): string {
  return lang === 'zh'
    ? '食材已经被加工过多次了，无法继续下去了……'
    : 'This ingredient has been processed too many times...';
}

// 添加加工步骤
export function addProcessStep(
  item: KitchenItem,
  method: AnyCookingMethod,
  mode?: 'MERGE' | 'SEPARATE',
  seasonings?: string[]
): KitchenItem {
  if (!canProcess(item)) {
    return item;
  }

  const newStep: ProcessStep = {
    method,
    timestamp: Date.now(),
    mode,
    seasonings,
  };

  // 根据方法确定新状态
  const statusMap: Record<string, ItemStatus> = {
    [PrepMethod.CHOP]: 'chopped',
    [PrepMethod.SLICE]: 'sliced',
    [PrepMethod.JULIENNE]: 'julienned',
    [PrepMethod.MASH]: 'mashed',
    [PrepMethod.GRIND]: 'ground',
    [PrepMethod.BLEND]: 'blended',
    [PrepMethod.AIR_DRY]: 'dried',
    [PrepMethod.DEHYDRATE]: 'dehydrated',
    [MarinateMethod.MARINATE]: 'marinated',
    [MarinateMethod.BRINE]: 'brined',
    [MarinateMethod.COAT]: 'coated',
    [MarinateMethod.BATTER]: 'battered',
    [HeatMethod.BOIL]: 'boiled',
    [HeatMethod.STEAM]: 'steamed',
    [HeatMethod.BRAISE]: 'braised',
    [HeatMethod.FRY]: 'fried',
    [HeatMethod.DEEP_FRY]: 'deep_fried',
    [HeatMethod.STIR_FRY]: 'stir_fried',
    [HeatMethod.BAKE]: 'baked',
    [HeatMethod.GRILL]: 'grilled',
    [HeatMethod.MICROWAVE]: 'microwaved',
    [MixMethod.SHAKE]: 'shaken',
    [MixMethod.STIR]: 'stirred',
    [MixMethod.BUILD]: 'layered',
    [MixMethod.ADD_ICE]: 'iced',
    [MixMethod.STRAIN]: 'strained',
  };

  const newStatus = statusMap[method] || item.status;
  const newStatuses = [...item.statuses.filter(s => s !== 'raw'), newStatus];

  return {
    ...item,
    statuses: newStatuses,
    status: newStatus,
    processHistory: [...item.processHistory, newStep],
    marinadeLabels: seasonings
      ? [...(item.marinadeLabels || []), ...seasonings]
      : item.marinadeLabels,
  };
}

// 合并多个食材
export function mergeItems(items: KitchenItem[], method: AnyCookingMethod): KitchenItem {
  if (items.length === 0) {
    throw new Error('Cannot merge empty items');
  }

  const firstItem = items[0];
  const mergedEmojis = items.map(i => i.emoji);
  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);

  // 合并所有状态
  const allStatuses = new Set<ItemStatus>();
  items.forEach(item => {
    item.statuses.forEach(s => allStatuses.add(s));
  });
  allStatuses.delete('raw');

  // 确定新状态
  // 确定新状态
  const statusMap: Record<string, ItemStatus> = {
    [PrepMethod.BLEND]: 'blended',
    [PrepMethod.MASH]: 'mashed',
    [PrepMethod.CHOP]: 'chopped',
    [PrepMethod.SLICE]: 'sliced',
    [PrepMethod.JULIENNE]: 'julienned',
    [PrepMethod.GRIND]: 'ground',
  };
  const newStatus = statusMap[method] || 'blended';
  allStatuses.add(newStatus);

  // Generate Descriptive Name
  // e.g., "Mashed Potato & Carrot" or "Chopped Fruit Mix"
  const distinctNames = Array.from(new Set(items.map(i => i.name)));
  let newName = 'Mixture';
  let newNameZh = '混合物';

  if (distinctNames.length === 1) {
    // Identical items
    newName = `${distinctNames[0]} (x${items.length})`;
    newNameZh = `${items[0].nameZh || distinctNames[0]} (x${items.length})`;
  } else if (distinctNames.length <= 3) {
    newName = `${distinctNames.join(' & ')} Mix`;
    newNameZh = `${distinctNames.map(n => items.find(i => i.name === n)?.nameZh || n).join('与')}混合`;
  } else {
    newName = `${distinctNames.slice(0, 2).join(', ')} & more Mix`;
    newNameZh = `${distinctNames.slice(0, 2).map(n => items.find(i => i.name === n)?.nameZh || n).join('、')}等混合`;
  }

  // Prepend method adjective
  const methodAdj: Record<string, { en: string, zh: string }> = {
    [PrepMethod.MASH]: { en: 'Mashed', zh: '捣碎的' },
    [PrepMethod.BLEND]: { en: 'Blended', zh: '搅拌的' },
    [PrepMethod.CHOP]: { en: 'Chopped', zh: '切碎的' },
    [PrepMethod.SLICE]: { en: 'Sliced', zh: '切片的' },
    [PrepMethod.GRIND]: { en: 'Ground', zh: '磨粉的' },
  };

  if (methodAdj[method]) {
    newName = `${methodAdj[method].en} ${newName}`;
    newNameZh = `${methodAdj[method].zh}${newNameZh}`;
  }

  const mergedItem: KitchenItem = {
    id: `merged_${Date.now()}`,
    instanceId: `merged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newName,
    nameZh: newNameZh,
    emoji: mergedEmojis.slice(0, 3).join(''),  // 最多显示3个emoji
    category: firstItem.category,
    color: 'bg-gradient-to-r from-stone-200 to-stone-300', // Default mix color
    price: totalPrice,
    statuses: Array.from(allStatuses),
    status: newStatus,
    processHistory: [{
      method,
      timestamp: Date.now(),
      mode: 'MERGE',
    }],
    isMerged: true,
    mergedFrom: mergedEmojis,
    mergedItemCount: items.length,
    marinadeLabels: items.flatMap(i => i.marinadeLabels || []),
  };

  return mergedItem;
}