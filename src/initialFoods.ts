import { FoodItem, NutritionValues } from "./types";

// ============================================================================
// 1. 基礎類型與智能建構器 (Builder Helpers)
// ============================================================================

/**
 * 緊湊型營養素定義：使開發者在手動宣告時不需打滿 16 個微量屬性即可快速錄入。
 * 未提供之數值將預設補 0。
 */
interface CompactNutrients {
  energy?: number;
  protein?: number;
  fat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  carbohydrate?: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
  calcium?: number;
  potassium?: number;
  phosphorus?: number;
  magnesium?: number;
  zinc?: number;
  iron?: number;
}

/**
 * 補全 16 項微量營養成份，回傳符合 TypeScript 定義的完整標記實體
 */
function fillNutrients(compact?: CompactNutrients): NutritionValues {
  return {
    energy:       compact?.energy ?? 0,
    protein:      compact?.protein ?? 0,
    fat:          compact?.fat ?? 0,
    saturatedFat: compact?.saturatedFat ?? 0,
    transFat:     compact?.transFat ?? 0,
    cholesterol:  compact?.cholesterol ?? 0,
    carbohydrate: compact?.carbohydrate ?? 0,
    sugar:        compact?.sugar ?? 0,
    fiber:        compact?.fiber ?? 0,
    sodium:       compact?.sodium ?? 0,
    calcium:      compact?.calcium ?? 0,
    potassium:    compact?.potassium ?? 0,
    phosphorus:   compact?.phosphorus ?? 0,
    magnesium:    compact?.magnesium ?? 0,
    zinc:         compact?.zinc ?? 0,
    iron:         compact?.iron ?? 0,
  };
}

/**
 * 依基準份量與 100g 比例，自動雙向精算並補足微量元素（降低手工 key 數值的維護時間及計算疏漏）
 */
function autoScaleNutrients(serving: NutritionValues, servingValue: number): NutritionValues {
  if (!servingValue || servingValue <= 0) return serving;
  const ratio = 100 / servingValue;
  const scaled = {} as any;
  for (const key of Object.keys(serving) as Array<keyof NutritionValues>) {
    scaled[key] = parseFloat((serving[key] * ratio).toFixed(2));
  }
  return scaled;
}

/**
 * 統一食品規格生成函數：提供高階簡化宣告。若 per100g 未宣告，系統將智慧自動按 servingValue 比例精確補成。
 */
function buildFood(config: {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  servingSizeText: string;
  servingValue: number;
  isLiquid: boolean;
  perServing: CompactNutrients;
  per100g?: CompactNutrients;
}): Omit<FoodItem, "history"> {
  const perServingFull = fillNutrients(config.perServing);
  const per100gFull = config.per100g 
    ? fillNutrients(config.per100g)
    : autoScaleNutrients(perServingFull, config.servingValue);

  return {
    id: config.id,
    name: config.name,
    brand: config.brand,
    barcode: config.barcode,
    category: config.category,
    image: "",
    servingSizeText: config.servingSizeText,
    servingValue: config.servingValue,
    isLiquid: config.isLiquid,
    perServing: perServingFull,
    per100g: per100gFull,
  };
}

// ============================================================================
// 2. 標竿與預載食品資料庫宣告 (Initial Benchmark Foods DB)
// ============================================================================

export const INITIAL_FOODS: Omit<FoodItem, "history">[] = [
  
  // --------------------------------------------------------------------------
  // 分類一：原型食材、穀物、蛋與水果 (Whole Foods, Grains & Seeds)
  // --------------------------------------------------------------------------
  buildFood({
    id: "viva-nuts-01",
    name: "無調味綜合果",
    brand: "萬歲牌",
    barcode: "4710022026362",
    category: "堅果種子",
    servingSizeText: "本包裝含28份，每份28公克",
    servingValue: 28,
    isLiquid: false,
    perServing: { energy: 181, protein: 4.8, fat: 15.6, saturatedFat: 1.8, carbohydrate: 5.4, sugar: 1.1, fiber: 2.2, sodium: 1, calcium: 32, potassium: 188, phosphorus: 120, magnesium: 51, zinc: 0.9, iron: 1.2 },
    per100g:    { energy: 646, protein: 17.1, fat: 55.7, saturatedFat: 6.4, carbohydrate: 19.3, sugar: 3.9, fiber: 7.9, sodium: 4, calcium: 114, potassium: 671, phosphorus: 429, magnesium: 182, zinc: 3.2, iron: 4.3 }
  }),

  buildFood({
    id: "chicken-01",
    name: "即食雞胸肉-原味",
    brand: "卜蜂",
    barcode: "4710254005119",
    category: "肉類與蛋",
    servingSizeText: "每一份量100公克，本包裝含1份",
    servingValue: 100,
    isLiquid: false,
    perServing: { energy: 114, protein: 22.3, fat: 2.1, saturatedFat: 0.6, cholesterol: 58, carbohydrate: 1.5, sodium: 412, calcium: 12, potassium: 250, phosphorus: 180, magnesium: 24, zinc: 0.8, iron: 0.4 }
  }),

  buildFood({
    id: "quaker-oats-01",
    name: "即食燕麥片",
    brand: "桂格",
    barcode: "4710043024506",
    category: "穀物雜糧",
    servingSizeText: "每一份量37.5公克，本包裝含21份",
    servingValue: 37.5,
    isLiquid: false,
    perServing: { energy: 140, protein: 5.0, fat: 3.1, saturatedFat: 0.6, carbohydrate: 25.1, sugar: 0.4, fiber: 3.7, sodium: 1, calcium: 18, potassium: 131, phosphorus: 154, magnesium: 44, zinc: 1.1, iron: 1.5 },
    per100g:    { energy: 373, protein: 13.3, fat: 8.3, saturatedFat: 1.6, carbohydrate: 67.0, sugar: 1.1, fiber: 9.9, sodium: 2, calcium: 48, potassium: 350, phosphorus: 411, magnesium: 117, zinc: 2.9, iron: 4.0 }
  }),

  buildFood({
    id: "taiwan-banana-01",
    name: "台灣當季香蕉",
    brand: "綠之園農產",
    barcode: "4712345670891",
    category: "當季水果",
    servingSizeText: "每一份量120公克，本包裝含1份",
    servingValue: 120,
    isLiquid: false,
    perServing: { energy: 102, protein: 1.3, fat: 0.2, saturatedFat: 0.1, carbohydrate: 26.4, sugar: 14.4, fiber: 3.1, sodium: 1, calcium: 6, potassium: 430, phosphorus: 26, magnesium: 32, zinc: 0.18, iron: 0.3 },
    per100g:    { energy: 85, protein: 1.1, fat: 0.17, saturatedFat: 0.08, carbohydrate: 22.0, sugar: 12.0, fiber: 2.6, sodium: 1, calcium: 5, potassium: 358, phosphorus: 22, magnesium: 27, zinc: 0.15, iron: 0.25 }
  }),

  // --------------------------------------------------------------------------
  // 分類二：乳製品與鮮乳類 (Miks & Yoghurts)
  // --------------------------------------------------------------------------
  buildFood({
    id: "imei-milk-01",
    name: "低脂鮮乳",
    brand: "義美",
    barcode: "4712439121088",
    category: "乳製品",
    servingSizeText: "本包裝含1份，每份290毫升",
    servingValue: 290,
    isLiquid: true,
    perServing: { energy: 131, protein: 9.3, fat: 4.4, saturatedFat: 2.9, cholesterol: 15, carbohydrate: 13.9, sugar: 13.9, sodium: 122, calcium: 319, potassium: 435, phosphorus: 250, magnesium: 29, zinc: 1.1, iron: 0.1 },
    per100g:    { energy: 45, protein: 3.2, fat: 1.5, saturatedFat: 1.0, cholesterol: 5.2, carbohydrate: 4.8, sugar: 4.8, sodium: 42, calcium: 110, potassium: 150, phosphorus: 86, magnesium: 10, zinc: 0.38, iron: 0.03 }
  }),

  buildFood({
    id: "added-milk-01",
    name: "全脂牛奶 240 cc",
    brand: "一般乳品",
    barcode: "4710000010001",
    category: "全脂乳品類",
    servingSizeText: "每份240毫升",
    servingValue: 240,
    isLiquid: true,
    perServing: { energy: 150, protein: 8, fat: 8, carbohydrate: 12, sodium: 120, calcium: 280, potassium: 360, phosphorus: 210, magnesium: 24, zinc: 0.9, iron: 0.1 }
  }),

  buildFood({
    id: "added-milk-02",
    name: "統一營養強化高鈣牛乳 400ml",
    brand: "統一",
    barcode: "4710088411034",
    category: "全脂乳品類",
    servingSizeText: "本包裝含1份，每份400毫升",
    servingValue: 400,
    isLiquid: true,
    perServing: { energy: 301.6, protein: 15.2, fat: 13.6, saturatedFat: 8.8, cholesterol: 40, carbohydrate: 29.6, sugar: 28.5, sodium: 252, calcium: 520, potassium: 620, phosphorus: 340, magnesium: 32, zinc: 1.2, iron: 0.1 },
    per100g:    { energy: 75.4, protein: 3.8, fat: 3.4, saturatedFat: 2.2, cholesterol: 10, carbohydrate: 7.4, sugar: 7.13, sodium: 63, calcium: 130, potassium: 155, phosphorus: 85, magnesium: 8, zinc: 0.3, iron: 0.03 }
  }),

  buildFood({
    id: "added-milk-03",
    name: "光泉優質蛋白牛乳 (巧克力口味) 400ml",
    brand: "光泉",
    barcode: "4710141123453",
    category: "全脂乳品類",
    servingSizeText: "本包裝含1份，每份400毫升",
    servingValue: 400,
    isLiquid: true,
    perServing: { energy: 211.6, protein: 20, fat: 2, saturatedFat: 1.2, cholesterol: 8, carbohydrate: 28.4, sugar: 26.5, fiber: 0.8, sodium: 232, calcium: 400, potassium: 540, phosphorus: 300, magnesium: 28, zinc: 1.0, iron: 0.4 },
    per100g:    { energy: 52.9, protein: 5, fat: 0.5, saturatedFat: 0.3, cholesterol: 2, carbohydrate: 7.1, sugar: 6.63, fiber: 0.2, sodium: 58, calcium: 100, potassium: 135, phosphorus: 75, magnesium: 7, zinc: 0.25, iron: 0.1 }
  }),

  buildFood({
    id: "added-milk-06",
    name: "林鳳營全脂鮮乳 200ml",
    brand: "林鳳營",
    barcode: "4710012304918",
    category: "全脂乳品類",
    servingSizeText: "本包裝含1份，每份200毫升",
    servingValue: 200,
    isLiquid: true,
    perServing: { energy: 131, protein: 6.4, fat: 7.4, saturatedFat: 4.8, cholesterol: 22, carbohydrate: 9.6, sugar: 9.6, sodium: 90, calcium: 220, potassium: 300, phosphorus: 180, magnesium: 20, zinc: 0.8, iron: 0.1 },
    per100g:    { energy: 65.5, protein: 3.2, fat: 3.7, saturatedFat: 2.4, cholesterol: 11, carbohydrate: 4.8, sugar: 4.8, sodium: 45, calcium: 110, potassium: 150, phosphorus: 90, magnesium: 10, zinc: 0.4, iron: 0.05 }
  }),

  buildFood({
    id: "added-milk-07",
    name: "克寧100%純生乳奶粉 (36g/份)",
    brand: "克寧",
    barcode: "4710025112341",
    category: "全脂乳品類",
    servingSizeText: "每一份（調配一杯）36公克",
    servingValue: 36,
    isLiquid: false,
    perServing: { energy: 177, protein: 8.5, fat: 9.2, saturatedFat: 5.8, transFat: 0.3, cholesterol: 28, carbohydrate: 15.1, sugar: 15.1, sodium: 108, calcium: 290, potassium: 380, phosphorus: 210, magnesium: 25, zinc: 0.9, iron: 0.2 },
    per100g:    { energy: 491.67, protein: 23.61, fat: 25.56, saturatedFat: 16.11, transFat: 0.83, cholesterol: 77.78, carbohydrate: 41.94, sugar: 41.94, sodium: 300, calcium: 805.56, potassium: 1055.56, phosphorus: 583.33, magnesium: 69.44, zinc: 2.5, iron: 0.56 }
  }),

  buildFood({
    id: "added-milk-08",
    name: "克寧100%純脫脂奶粉 (28g/份)",
    brand: "克寧",
    barcode: "4710025112358",
    category: "脫脂乳品類",
    servingSizeText: "每一份（調配一杯）28公克",
    servingValue: 28,
    isLiquid: false,
    perServing: { energy: 101, protein: 9.4, fat: 0.3, saturatedFat: 0.2, cholesterol: 2, carbohydrate: 15.1, sugar: 15.1, sodium: 109, calcium: 335, potassium: 440, phosphorus: 245, magnesium: 30, zinc: 1.1, iron: 0.1 },
    per100g:    { energy: 360.71, protein: 33.57, fat: 1.07, saturatedFat: 0.71, cholesterol: 7.14, carbohydrate: 53.93, sugar: 53.93, sodium: 389.29, calcium: 1196.43, potassium: 1571.43, phosphorus: 875, magnesium: 107.14, zinc: 3.93, iron: 0.36 }
  }),

  buildFood({
    id: "added-milk-09",
    name: "克寧高鈣雙效(葡萄糖胺+Omega 3) 245ml",
    brand: "克寧",
    barcode: "4710025112365",
    category: "脫脂乳品類",
    servingSizeText: "本包裝含1份，每份245毫升",
    servingValue: 245,
    isLiquid: true,
    perServing: { energy: 146, protein: 9.8, fat: 4.6, saturatedFat: 2.8, cholesterol: 6, carbohydrate: 16.4, sugar: 14.8, fiber: 1.2, sodium: 108, calcium: 320, potassium: 441, phosphorus: 262, magnesium: 28, zinc: 1.0, iron: 0.3 },
    per100g:    { energy: 59.59, protein: 4, fat: 1.88, saturatedFat: 1.14, cholesterol: 2.45, carbohydrate: 6.69, sugar: 6.04, fiber: 0.49, sodium: 44.08, calcium: 130.61, potassium: 180, phosphorus: 106.94, magnesium: 11.43, zinc: 0.41, iron: 0.12 }
  }),

  buildFood({
    id: "added-milk-13",
    name: "低脂起司片 2片",
    brand: "一般乳業",
    barcode: "4711100202021",
    category: "低脂乳品類",
    servingSizeText: "本包裝含2片，每份40公克",
    servingValue: 40,
    isLiquid: false,
    perServing: { energy: 120, protein: 8, fat: 4, saturatedFat: 2.6, transFat: 0.1, cholesterol: 12, carbohydrate: 12, sugar: 1.5, sodium: 320, calcium: 240, potassium: 60, phosphorus: 150, magnesium: 12, zinc: 0.6, iron: 0.1 },
    per100g:    { energy: 300, protein: 20, fat: 10, saturatedFat: 6.5, transFat: 0.25, cholesterol: 30, carbohydrate: 30, sugar: 3.75, sodium: 800, calcium: 600, potassium: 150, phosphorus: 375, magnesium: 30, zinc: 1.5, iron: 0.25 }
  }),

  buildFood({
    id: "added-milk-14",
    name: "低脂牛奶 240 cc",
    brand: "一般乳業",
    barcode: "4711100303032",
    category: "低脂乳品類",
    servingSizeText: "每份240毫升",
    servingValue: 240,
    isLiquid: true,
    perServing: { energy: 120, protein: 8, fat: 4, saturatedFat: 2.5, cholesterol: 12, carbohydrate: 12, sugar: 11.5, sodium: 115, calcium: 280, potassium: 360, phosphorus: 210, magnesium: 24, zinc: 0.9, iron: 0.1 },
    per100g:    { energy: 50, protein: 3.33, fat: 1.67, saturatedFat: 1.04, cholesterol: 5, carbohydrate: 5, sugar: 4.79, sodium: 47.92, calcium: 116.67, potassium: 150, phosphorus: 87.5, magnesium: 10, zinc: 0.38, iron: 0.04 }
  }),

  buildFood({
    id: "added-milk-15",
    name: "優格 180g",
    brand: "一般乳業",
    barcode: "4711100404043",
    category: "低脂乳品類",
    servingSizeText: "每份180公克",
    servingValue: 180,
    isLiquid: false,
    perServing: { energy: 200, protein: 8, fat: 4, saturatedFat: 2.4, cholesterol: 15, carbohydrate: 32, sugar: 24, fiber: 0.5, sodium: 90, calcium: 220, potassium: 280, phosphorus: 180, magnesium: 18, zinc: 0.8, iron: 0.1 },
    per100g:    { energy: 111.11, protein: 4.44, fat: 2.22, saturatedFat: 1.33, cholesterol: 8.33, carbohydrate: 17.78, sugar: 13.33, fiber: 0.28, sodium: 50, calcium: 122.22, potassium: 155.56, phosphorus: 100, magnesium: 10, zinc: 0.44, iron: 0.06 }
  }),

  buildFood({
    id: "added-milk-16",
    name: "植物の優鮮美橘瓣優格 200g",
    brand: "植物の優",
    barcode: "4710012351233",
    category: "低脂乳品類",
    servingSizeText: "本包裝含1份，每份200公克",
    servingValue: 200,
    isLiquid: false,
    perServing: { energy: 180, protein: 7, fat: 4.4, saturatedFat: 2.8, cholesterol: 10, carbohydrate: 28.2, sugar: 22.4, fiber: 0.6, sodium: 56, calcium: 200, potassium: 240, phosphorus: 160, magnesium: 16, zinc: 0.7, iron: 0.1 },
    per100g:    { energy: 90, protein: 3.5, fat: 2.2, saturatedFat: 1.4, cholesterol: 5, carbohydrate: 14.1, sugar: 11.2, fiber: 0.3, sodium: 28, calcium: 100, potassium: 120, phosphorus: 80, magnesium: 8, zinc: 0.35, iron: 0.05 }
  }),

  buildFood({
    id: "added-milk-17",
    name: "無糖優酪乳 200cc",
    brand: "一般乳業",
    barcode: "4711100505054",
    category: "低脂乳品類",
    servingSizeText: "每份200毫升",
    servingValue: 200,
    isLiquid: true,
    perServing: { energy: 180, protein: 8, fat: 4, saturatedFat: 2.4, cholesterol: 12, carbohydrate: 27, sugar: 12.5, fiber: 1.0, sodium: 110, calcium: 240, potassium: 310, phosphorus: 190, magnesium: 20, zinc: 0.8, iron: 0.1 },
    per100g:    { energy: 90, protein: 4, fat: 2, saturatedFat: 1.2, cholesterol: 6, carbohydrate: 13.5, sugar: 6.25, fiber: 0.5, sodium: 55, calcium: 120, potassium: 155, phosphorus: 95, magnesium: 10, zinc: 0.4, iron: 0.05 }
  }),

  buildFood({
    id: "added-milk-18",
    name: "711 AB優洛乳（無加糖） 517ml",
    brand: "統一 AB",
    barcode: "4710088435160",
    category: "低脂乳品類",
    servingSizeText: "本包裝含1份，每份517毫升",
    servingValue: 517,
    isLiquid: true,
    perServing: { energy: 298, protein: 16, fat: 6.8, saturatedFat: 4.1, cholesterol: 10, carbohydrate: 43.4, sugar: 28.4, fiber: 8.8, sodium: 268, calcium: 517, potassium: 620, phosphorus: 410, magnesium: 51.7, zinc: 1.5, iron: 0.2 },
    per100g:    { energy: 57.64, protein: 3.09, fat: 1.32, saturatedFat: 0.79, cholesterol: 1.93, carbohydrate: 8.4, sugar: 5.49, fiber: 1.7, sodium: 51.84, calcium: 100, potassium: 119.92, phosphorus: 79.3, magnesium: 10, zinc: 0.29, iron: 0.04 }
  }),

  buildFood({
    id: "added-milk-19",
    name: "711 AB優洛乳（原味） 517ml",
    brand: "統一 AB",
    barcode: "4710088435177",
    category: "低脂乳品類",
    servingSizeText: "本包裝含1份，每份517毫升",
    servingValue: 517,
    isLiquid: true,
    perServing: { energy: 310, protein: 15.6, fat: 3.2, saturatedFat: 2.1, cholesterol: 12, carbohydrate: 54.8, sugar: 48.5, fiber: 0.5, sodium: 268, calcium: 517, potassium: 620, phosphorus: 410, magnesium: 51.7, zinc: 1.4, iron: 0.2 },
    per100g:    { energy: 59.96, protein: 3.02, fat: 0.62, saturatedFat: 0.41, cholesterol: 2.32, carbohydrate: 10.6, sugar: 9.38, fiber: 0.1, sodium: 51.84, calcium: 100, potassium: 119.92, phosphorus: 79.3, magnesium: 10, zinc: 0.27, iron: 0.04 }
  }),

  buildFood({
    id: "added-milk-20",
    name: "馬修嚴選 綜合莓優格百匯 125g",
    brand: "馬修嚴選",
    barcode: "4711124430113",
    category: "低脂乳品類",
    servingSizeText: "本包裝含1份，每份125公克",
    servingValue: 125,
    isLiquid: false,
    perServing: { energy: 150, protein: 3.4, fat: 3.5, saturatedFat: 2.1, cholesterol: 8, carbohydrate: 26.1, sugar: 18.5, fiber: 1.8, sodium: 70, calcium: 110, potassium: 160, phosphorus: 100, magnesium: 15, zinc: 0.5, iron: 0.4 },
    per100g:    { energy: 120, protein: 2.72, fat: 2.8, saturatedFat: 1.68, cholesterol: 6.4, carbohydrate: 20.88, sugar: 14.8, fiber: 1.44, sodium: 56, calcium: 88, potassium: 128, phosphorus: 80, magnesium: 12, zinc: 0.4, iron: 0.32 }
  }),

  buildFood({
    id: "added-milk-21",
    name: "鮮乳坊 真優格-豐樂牧場鮮乳優格 450g",
    brand: "鮮乳坊",
    barcode: "4711124430229",
    category: "低脂乳品類",
    servingSizeText: "本包裝含1份，每份450公克",
    servingValue: 450,
    isLiquid: false,
    perServing: { energy: 296.1, protein: 15.9, fat: 17.1, saturatedFat: 11.2, cholesterol: 35, carbohydrate: 19.8, sugar: 18.9, sodium: 170, calcium: 450, potassium: 620, phosphorus: 380, magnesium: 45, zinc: 1.8, iron: 0.2 },
    per100g:    { energy: 65.8, protein: 3.53, fat: 3.8, saturatedFat: 2.49, cholesterol: 7.78, carbohydrate: 4.4, sugar: 4.2, sodium: 37.78, calcium: 100, potassium: 137.78, phosphorus: 84.44, magnesium: 10, zinc: 0.4, iron: 0.04 }
  }),

  buildFood({
    id: "added-milk-22",
    name: "鮮乳坊 真優格-每日爽快 300g",
    brand: "鮮乳坊",
    barcode: "4711124430236",
    category: "低脂乳品類",
    servingSizeText: "本包裝含1份，每份300公克",
    servingValue: 300,
    isLiquid: false,
    perServing: { energy: 226.8, protein: 9.3, fat: 11.4, saturatedFat: 7.5, cholesterol: 24, carbohydrate: 27.7, sugar: 26.1, fiber: 0.2, sodium: 120, calcium: 300, potassium: 420, phosphorus: 250, magnesium: 30, zinc: 1.1, iron: 0.3 },
    per100g:    { energy: 75.6, protein: 3.1, fat: 3.8, saturatedFat: 2.5, cholesterol: 8, carbohydrate: 9.23, sugar: 8.7, fiber: 0.07, sodium: 40, calcium: 100, potassium: 140, phosphorus: 83.33, magnesium: 10, zinc: 0.37, iron: 0.1 }
  }),

  // --------------------------------------------------------------------------
  // 分類三：保健食品與機能配方 (Nutraceuticals & Supplement)
  // --------------------------------------------------------------------------
  buildFood({
    id: "added-milk-10",
    name: "克寧UC-II優蛋白配方 (43g/包) 245ml",
    brand: "克寧",
    barcode: "4710025112372",
    category: "保健品類",
    servingSizeText: "本包裝含1份，每份245毫升",
    servingValue: 245,
    isLiquid: true,
    perServing: { energy: 166, protein: 12, fat: 2.3, saturatedFat: 1.4, cholesterol: 4, carbohydrate: 24.3, sugar: 21.6, fiber: 0.8, sodium: 151, calcium: 350, potassium: 258, phosphorus: 280, magnesium: 24, zinc: 0.8, iron: 0.5 },
    per100g:    { energy: 67.76, protein: 4.9, fat: 0.94, saturatedFat: 0.57, cholesterol: 1.63, carbohydrate: 9.92, sugar: 8.82, fiber: 0.33, sodium: 61.63, calcium: 142.86, potassium: 105.31, phosphorus: 114.29, magnesium: 9.8, zinc: 0.33, iron: 0.2 }
  }),

  buildFood({
    id: "added-milk-11",
    name: "克寧穩均含鉻 (38g/份)200ml",
    brand: "克寧",
    barcode: "4710025112389",
    category: "保健品類",
    servingSizeText: "本包裝含1份，每份200毫升",
    servingValue: 200,
    isLiquid: true,
    perServing: { energy: 101, protein: 8.8, fat: 1.8, saturatedFat: 1.1, cholesterol: 3, carbohydrate: 20.7, sugar: 18.5, fiber: 1.5, sodium: 93, calcium: 280, potassium: 350, phosphorus: 200, magnesium: 22, zinc: 0.9, iron: 0.4 },
    per100g:    { energy: 50.5, protein: 4.4, fat: 0.9, saturatedFat: 0.55, cholesterol: 1.5, carbohydrate: 10.35, sugar: 9.25, fiber: 0.75, sodium: 46.5, calcium: 140, potassium: 175, phosphorus: 100, magnesium: 11, zinc: 0.45, iron: 0.2 }
  }),

  buildFood({
    id: "added-milk-12",
    name: "安怡 優蛋白Ex 200ml",
    brand: "安怡",
    barcode: "4710189736125",
    category: "保健品類",
    servingSizeText: "本包裝含1份，每份200毫升",
    servingValue: 200,
    isLiquid: true,
    perServing: { energy: 145, protein: 15, fat: 1.5, saturatedFat: 0.9, cholesterol: 5, carbohydrate: 18.3, sugar: 16.2, fiber: 1.0, sodium: 70, calcium: 400, potassium: 380, phosphorus: 150, magnesium: 25, zinc: 1.0, iron: 0.8 },
    per100g:    { energy: 72.5, protein: 7.5, fat: 0.75, saturatedFat: 0.45, cholesterol: 2.5, carbohydrate: 9.15, sugar: 8.1, fiber: 0.5, sodium: 35, calcium: 200, potassium: 190, phosphorus: 75, magnesium: 12.5, zinc: 0.5, iron: 0.4 }
  }),

  // --------------------------------------------------------------------------
  // 分類四：外食生活、包裝熟食與飲料 (Ready-to-Eat, Beverages & Oils)
  // --------------------------------------------------------------------------
  buildFood({
    id: "added-milk-04",
    name: "福樂超能蛋白營養牛乳(草莓口味) 375ml",
    brand: "福樂",
    barcode: "4710255123492",
    category: "外食類",
    servingSizeText: "本包裝含1份，每份375毫升",
    servingValue: 375,
    isLiquid: true,
    perServing: { energy: 208, protein: 21.8, fat: 1.1, saturatedFat: 0.7, cholesterol: 6, carbohydrate: 27.8, sugar: 25.4, fiber: 0.4, sodium: 229.5, calcium: 380, potassium: 480, phosphorus: 260, magnesium: 25, zinc: 0.9, iron: 0.2 },
    per100g:    { energy: 55.47, protein: 5.81, fat: 0.29, saturatedFat: 0.19, cholesterol: 1.6, carbohydrate: 7.41, sugar: 6.77, fiber: 0.11, sodium: 61.2, calcium: 101.33, potassium: 128, phosphorus: 69.33, magnesium: 6.67, zinc: 0.24, iron: 0.05 }
  }),

  buildFood({
    id: "added-milk-05",
    name: "福樂超能蛋白營養牛乳(堅果可可口味) 375ml",
    brand: "福樂",
    barcode: "4710255123508",
    category: "外食類",
    servingSizeText: "本包裝含1份，每份375毫升",
    servingValue: 375,
    isLiquid: true,
    perServing: { energy: 205, protein: 21.4, fat: 2.6, saturatedFat: 1.5, cholesterol: 8, carbohydrate: 24, sugar: 21.5, fiber: 1.2, sodium: 276.4, calcium: 380, potassium: 520, phosphorus: 280, magnesium: 30, zinc: 1.1, iron: 0.5 },
    per100g:    { energy: 54.67, protein: 5.71, fat: 0.69, saturatedFat: 0.4, cholesterol: 2.13, carbohydrate: 6.4, sugar: 5.73, fiber: 0.32, sodium: 73.71, calcium: 101.33, potassium: 138.67, phosphorus: 74.67, magnesium: 8, zinc: 0.29, iron: 0.13 }
  }),

  buildFood({
    id: "soy-milk-01",
    name: "高纖無糖豆漿",
    brand: "統一元氣種子",
    barcode: "4710088432138",
    category: "飲料",
    servingSizeText: "每一份量400毫升，本包裝含1份",
    servingValue: 400,
    isLiquid: true,
    perServing: { energy: 132, protein: 13.6, fat: 5.6, saturatedFat: 0.8, carbohydrate: 11.2, sugar: 0.8, fiber: 9.6, sodium: 48, calcium: 88, potassium: 480, phosphorus: 192, magnesium: 48, zinc: 0.8, iron: 2.0 },
    per100g:    { energy: 33, protein: 3.4, fat: 1.4, saturatedFat: 0.2, carbohydrate: 2.8, sugar: 0.2, fiber: 2.4, sodium: 12, calcium: 22, potassium: 120, phosphorus: 48, magnesium: 12, zinc: 0.2, iron: 0.5 }
  }),

  buildFood({
    id: "tomato-mackerel-01",
    name: "番茄汁鯖魚罐頭",
    brand: "同榮",
    barcode: "4710185011037",
    category: "即食與熟食",
    servingSizeText: "每一份量150公克，本包裝含1份",
    servingValue: 150,
    isLiquid: false,
    perServing: { energy: 213, protein: 23.4, fat: 11.1, saturatedFat: 3.3, cholesterol: 120, carbohydrate: 4.8, sugar: 3.2, fiber: 0.5, sodium: 620, calcium: 150, potassium: 380, phosphorus: 225, magnesium: 35, zinc: 1.4, iron: 2.1 },
    per100g:    { energy: 142, protein: 15.6, fat: 7.4, saturatedFat: 2.2, cholesterol: 80, carbohydrate: 3.2, sugar: 2.1, fiber: 0.33, sodium: 413, calcium: 100, potassium: 253, phosphorus: 150, magnesium: 23, zinc: 0.93, iron: 1.4 }
  }),

  buildFood({
    id: "sunflower-oil-01",
    name: "不飽和葵花油",
    brand: "泰山",
    barcode: "4710252110297",
    category: "醬料",
    servingSizeText: "每一份量10毫升，本包裝含200份",
    servingValue: 10,
    isLiquid: true,
    perServing: { energy: 82.8, fat: 9.2, saturatedFat: 1.1, transFat: 0.1 },
    per100g:    { energy: 828, fat: 92, saturatedFat: 11, transFat: 1.0 }
  })
];
