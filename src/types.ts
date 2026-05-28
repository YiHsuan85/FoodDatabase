/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NutritionValues {
  energy: number;          // 熱量 (kcal)
  protein: number;         // 蛋白質 (g)
  fat: number;             // 脂肪 (g)
  saturatedFat: number;    // 飽和脂肪 (g)
  transFat: number;        // 反式脂肪 (g)
  cholesterol: number;     // 膽固醇 (mg)
  carbohydrate: number;    // 碳水化合物 (g)
  sugar: number;           // 糖 (g)
  fiber: number;           // 纖維 (g)
  sodium: number;          // 鈉 (mg)
  calcium: number;         // 鈣 (mg)
  potassium: number;       // 鉀 (mg)
  phosphorus: number;      // 磷 (mg)
  magnesium: number;       // 鎂 (mg)
  zinc: number;            // 鋅 (mg)
  iron: number;            // 鐵 (mg)
}

export interface VersionLog {
  id: string;
  timestamp: string;      // 格式：YYYY-MM-DD HH:mm:ss
  action: 'create' | 'update' | 'system_init';
  description: string;    // 例如: "新增此筆食物數據" 或 "修正蛋白質（由 5g 變更為 5.5g）"
  author: string;         // "管理者" 或 "系統初始化"
}

export interface FoodItem {
  id: string;
  name: string;           // 食物名稱
  brand: string;          // 品牌/製造商
  barcode: string;        // 條碼
  category: string;       // 類別 (例如: 穀物雜糧)
  image?: string;         // 食物圖片 (URL 或 base64)
  servingSizeText: string;// 基礎份量描述, 例如 "本包裝含2份，每份30公克" 或 "每份30公克"
  servingValue: number;   // 單份重量/容量 (公克/毫升)
  isLiquid: boolean;      // 是否為液體 (毫升/100毫升 或 公克/100公克)
  perServing: NutritionValues; // 每份營養標示
  per100g: NutritionValues;    // 每100公克/毫升營養標示
  history: VersionLog[];  // 版本紀錄
}

export const FOOD_CATEGORIES = [
  "穀物雜糧",
  "肉類與蛋",
  "海鮮水產",
  "新鮮蔬菜",
  "當季水果",
  "乳製品",
  "飲料",
  "休閒零嘴",
  "醬料",
  "即食與熟食",
  "堅果種子",    
  "健身補給",    
  "高蛋白點心",
  "全脂乳品類",
  "脫脂乳品類",
  "低脂乳品類",
  "保健品類",
  "外食類"
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number];

// 繁體中文全稱對照，方便前台展示
export const NUTRITION_LABELS: Record<keyof NutritionValues, { label: string; unit: string }> = {
  energy: { label: "熱量", unit: "kcal" },
  protein: { label: "蛋白質", unit: "g" },
  fat: { label: "脂肪", unit: "g" },
  saturatedFat: { label: "飽和脂肪", unit: "g" },
  transFat: { label: "反式脂肪", unit: "g" },
  cholesterol: { label: "膽固醇", unit: "mg" },
  carbohydrate: { label: "碳水化合物", unit: "g" },
  sugar: { label: "糖", unit: "g" },
  fiber: { label: "膳食纖維", unit: "g" },
  sodium: { label: "鈉", unit: "mg" },
  calcium: { label: "鈣", unit: "mg" },
  potassium: { label: "鉀", unit: "mg" },
  phosphorus: { label: "磷", unit: "mg" },
  magnesium: { label: "鎂", unit: "mg" },
  zinc: { label: "鋅", unit: "mg" },
  iron: { label: "鐵", unit: "mg" },
};
