/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// 1. 基礎營養成份定義 (Nutrition Values)
// ============================================================================

/**
 * 代表食品中含有的 16 項核心大宗與微量營養素
 */
export interface NutritionValues {
  // --- 核心熱量與巨量營養素 (Macronutrients) ---
  energy: number;          // 熱量 (kcal)
  protein: number;         // 蛋白質 (g)
  fat: number;             // 脂肪 (g)
  saturatedFat: number;    // 飽和脂肪 (g)
  transFat: number;        // 反式脂肪 (g)
  cholesterol: number;     // 膽固醇 (mg)
  carbohydrate: number;    // 碳水化合物 (g)
  sugar: number;           // 糖 (g)
  fiber: number;           // 膳食纖維 (g)

  // --- 微量元素與電解質 (Micronutrients & Electrolytes) ---
  sodium: number;          // 鈉 (mg)
  calcium: number;         // 鈣 (mg)
  potassium: number;       // 鉀 (mg)
  phosphorus: number;      // 磷 (mg)
  magnesium: number;       // 鎂 (mg)
  zinc: number;            // 鋅 (mg)
  iron: number;            // 鐵 (mg)
}

// ============================================================================
// 2. 審計與版本控管紀錄 (Audit & Version Logs)
// ============================================================================

/**
 * 追蹤此食品資料每次異動的歷史審計軌跡
 */
export interface VersionLog {
  id: string;             // 歷史版本唯一 ID
  timestamp: string;      // 格式：YYYY-MM-DD HH:mm:ss
  action: 'create' | 'update' | 'system_init';
  description: string;    // 進程異動描述。例："修正蛋白質（由 5g 變更為 5.5g）"
  author: string;         // 操作主體。例："管理者 yihsuanwu***@gmail.com" 或 "系統初始化"
}

// ============================================================================
// 3. 核心食物品項模型 (Core Food Item Interface)
// ============================================================================

/**
 * 代表資料庫中單一食品之完整規格與版本演進歷程
 */
export interface FoodItem {
  id: string;                 // 食品全域唯一識別碼
  name: string;               // 食物名稱 (例："高纖無糖豆漿")
  brand: string;              // 品牌或製造商名稱 (例："統一")
  barcode: string;            // 13 位商品條碼 (EAN / ISBN)
  category: string;           // 所屬分類項目 (例："低脂乳品類")
  image?: string;             // 附圖/包裝實物外觀檔 (含 Base64 縮圖)
  servingSizeText: string;    // 包裝規格描述 (例："每一份量 400 毫升，本包裝含 1 份")
  servingValue: number;       // 單份重量或容量之真實底層基準值 (例：400)
  isLiquid: boolean;          // 計量單位判定。true = 毫升(ml), false = 公克(g)
  perServing: NutritionValues;// 每份計量維度下的精準營養數據
  per100g: NutritionValues;   // 每 100g 或 每 100ml 理論維度的營養規格 (利於跨品項對比)
  history: VersionLog[];      // 該品項的所有修正與初始化歷史版本審計列表
}

// ============================================================================
// 4. 全域食品分類體系 (Food Classification System)
// ============================================================================

/**
 * 針對 300+ 多樣性原料食品、鮮乳、保健配方所定義的優化分類矩陣
 */
export const FOOD_CATEGORIES = [
  // --- 鮮乳與乳製品類 (Dairy & Yoghurts) ---
  "全脂乳品類",
  "低脂乳品類",
  "脫脂乳品類",
  "乳製品",

  // --- 原型食材與五穀肉類 (Whole Foods, Grains & Meat) ---
  "穀物雜糧",
  "肉類與蛋",
  "海鮮水產",
  "新鮮蔬菜",
  "當季水果",
  "堅果種子",
  "低脂豆魚蛋肉類",
  "中脂豆魚蛋肉類",
  "全榖雜糧類",
  "油脂與堅果類",

  // --- 機能補給與醫學保健類 (Functional Nutrition) ---
  "保健品類",
  "健身補給",
  "高蛋白點心",

  // --- 熟食調味與外食生活 (Processed & Dining Out) ---
  "外食類",
  "即食與熟食",
  "飲料",
  "休閒零嘴",
  "醬料"
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number];

// ============================================================================
// 5. 數據字典與繁體中文全稱對照 (Localization Metadata Dictionary)
// ============================================================================

/**
 * 中英文標示名稱、單位對照定義，保證前台分析與報表算力之輸出外觀
 */
export const NUTRITION_LABELS: Record<keyof NutritionValues, { label: string; unit: string }> = {
  // 核心與大宗營養素
  energy:       { label: "熱量",     unit: "kcal" },
  protein:      { label: "蛋白質",   unit: "g"    },
  fat:          { label: "脂肪",     unit: "g"    },
  saturatedFat: { label: "飽和脂肪", unit: "g"    },
  transFat:     { label: "反式脂肪", unit: "g"    },
  cholesterol:  { label: "膽固醇",   unit: "mg"   },
  carbohydrate: { label: "碳水化合物",unit: "g"    },
  sugar:        { label: "糖",       unit: "g"    },
  fiber:        { label: "膳食纖維", unit: "g"    },

  // 礦物質與微量元素
  sodium:       { label: "鈉",       unit: "mg"   },
  calcium:      { label: "鈣",       unit: "mg"   },
  potassium:    { label: "鉀",       unit: "mg"   },
  phosphorus:   { label: "磷",       unit: "mg"   },
  magnesium:    { label: "鎂",       unit: "mg"   },
  zinc:         { label: "鋅",       unit: "mg"   },
  iron:         { label: "鐵",       unit: "mg"   },
};

