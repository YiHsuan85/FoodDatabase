import { FoodItem, NutritionValues } from "./types";

// ============================================================================
// 1. 緊湊型資料定義與自動解析引擎 (High-Density Smart Parser Engine)
// ============================================================================

export interface DenseFood {
  id?: string;
  name: string;
  category: string;
  brand?: string;
  barcode?: string;
  servingValue?: number;
  isLiquid?: boolean;
  servingSizeText?: string;
  // 大宗與核心營養素
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar?: number;
  fiber?: number;
  satFat?: number;
  transFat?: number;
  cholesterol?: number;
  // 電解質與微量元素
  na?: number | string;
  ca?: number;
  k?: number | string;
  p?: number | string;
  mg?: number;
  zn?: number;
  fe?: number;
}

function num(val: any): number {
  if (val === undefined || val === null || val === "" || isNaN(Number(val))) return 0;
  return Number(val);
}

function parseDenseFood(item: DenseFood, index: number): Omit<FoodItem, "history"> {
  // 自動解析品牌 (當名稱開頭包含特定品牌)
  let brand = item.brand || "一般";
  const brands = [
    "統一陽光", "統一", "義美", "光泉", "桂格", "卜蜂", "萬歲牌", "同榮", "泰山",
    "愛之味", "大茂", "安怡", "克寧", "馬修嚴選", "鮮乳坊", "Qburger", "八方雲集",
    "好丘", "池上便當", "福樂", "植物の優", "林鳳營", "芝初", "天素地蔬", "元本山",
    "品客", "樂事", "樂天", "Lindt", "VANINI", "亞培", "艾益生", "補體素", "三多",
    "卡比", "立攝適", "益富", "思耐得", "維維樂", "賀寶芙"
  ];
  for (const b of brands) {
    if (item.name.startsWith(b)) {
      brand = b;
      break;
    }
  }
  if (item.name.includes("711") || item.name.includes("7-11")) brand = "7-11";
  else if (item.name.includes("Costco")) brand = "Costco";

  // 自動判斷液體 status
  let isLiquid = item.isLiquid;
  if (isLiquid === undefined) {
    const liquidKeywords = ["ml", "cc", "毫升", "露", "湯", "汁", "漿", "飲", "茶", "奶", "水", "可樂", "咖啡", "優酪乳"];
    isLiquid = liquidKeywords.some(kw => item.name.toLowerCase().includes(kw));
  }

  // 自動自名稱解析單份大小 (例: "375ml", "150g", "20g")
  let servingValue = item.servingValue || 100;
  if (item.servingValue === undefined) {
    const match = item.name.match(/(\d+(?:\.\d+)?)\s*(?:g|ml|cc|公克|毫升|片|顆|包|盒|瓶|支|塊|份)/i);
    if (match) servingValue = num(match[1]);
  }

  const unit = isLiquid ? "毫升" : "公克";
  const servingSizeText = item.servingSizeText || `每份裝含 ${servingValue} ${unit}`;
  const barcode = item.barcode || `EAN${String(1000000 + index)}`;
  const id = item.id || `food_${index}_${brand}_${item.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")}`;

  const perServing: NutritionValues = {
    energy: num(item.kcal),
    protein: num(item.protein),
    fat: num(item.fat),
    saturatedFat: num(item.satFat),
    transFat: num(item.transFat),
    cholesterol: num(item.cholesterol),
    carbohydrate: num(item.carbs),
    sugar: num(item.sugar),
    fiber: num(item.fiber),
    sodium: num(item.na),
    calcium: num(item.ca),
    potassium: num(item.k),
    phosphorus: num(item.p),
    magnesium: num(item.mg),
    zinc: num(item.zn),
    iron: num(item.fe)
  };

  const ratio = servingValue > 0 ? (100 / servingValue) : 1;
  const per100g: NutritionValues = {} as any;
  for (const k of Object.keys(perServing) as Array<keyof NutritionValues>) {
    per100g[k] = parseFloat((perServing[k] * ratio).toFixed(2));
  }

  const category = (item.category === "保健品" || item.category === "保健品類") ? "保健品類" : item.category;
  return { id, name: item.name, brand, barcode, category, servingSizeText, servingValue, isLiquid, perServing, per100g };
}

// ============================================================================
// 2. 超緊湊標竿數據列表 (Flat & Highly Dense Foods Database)
// ============================================================================

const DENSE_FOOD_SOURCE: DenseFood[] = [
  // --- 舊有精緻預載食品 (原始食品庫) ---
  { id: "viva-nuts-01", name: "無調味綜合果", category: "堅果種子", kcal: 181, protein: 4.8, fat: 15.6, carbs: 5.4, satFat: 1.8, sugar: 1.1, fiber: 2.2, na: 1, ca: 32, k: 188, p: 120, mg: 51, zn: 0.9, fe: 1.2, servingValue: 28 },
  { id: "chicken-01", name: "即食雞胸肉-原味", category: "肉類與蛋", kcal: 114, protein: 22.3, fat: 2.1, satFat: 0.6, cholesterol: 58, carbs: 1.5, na: 412, ca: 12, k: 250, p: 180, mg: 24, zn: 0.8, fe: 0.4, servingValue: 100 },
  { id: "quaker-oats-01", name: "即食燕麥片", category: "穀物雜糧", kcal: 140, protein: 5.0, fat: 3.1, satFat: 0.6, carbs: 25.1, sugar: 0.4, fiber: 3.7, na: 1, ca: 18, k: 131, p: 154, mg: 44, zn: 1.1, fe: 1.5, servingValue: 37.5 },
  { id: "taiwan-banana-01", name: "台灣當季香蕉", category: "當季水果", kcal: 102, protein: 1.3, fat: 0.2, satFat: 0.1, carbs: 26.4, sugar: 14.4, fiber: 3.1, na: 1, ca: 6, k: 430, p: 26, mg: 32, zn: 0.18, fe: 0.3, servingValue: 120 },
  { id: "imei-milk-01", name: "低脂鮮乳", category: "乳製品", kcal: 131, protein: 9.3, fat: 4.4, satFat: 2.9, cholesterol: 15, carbs: 13.9, sugar: 13.9, na: 122, ca: 319, k: 435, p: 250, mg: 29, zn: 1.1, fe: 0.1, servingValue: 290 },
  { id: "added-milk-01", name: "全脂牛奶 240 cc", category: "全脂乳品類", kcal: 150, protein: 8, fat: 8, carbs: 12, na: 120, ca: 280, k: 360, p: 210, mg: 24, zn: 0.9, fe: 0.1, servingValue: 240 },
  { id: "added-milk-02", name: "統一營養強化高鈣牛乳 400ml", category: "全脂乳品類", kcal: 301.6, protein: 15.2, fat: 13.6, satFat: 8.8, cholesterol: 40, carbs: 29.6, sugar: 28.5, na: 252, ca: 520, k: 620, p: 340, mg: 32, zn: 1.2, fe: 0.1, servingValue: 400 },
  { id: "added-milk-03", name: "光泉優質蛋白牛乳 (巧克力口味) 400ml", category: "全脂乳品類", kcal: 211.6, protein: 20, fat: 2, satFat: 1.2, cholesterol: 8, carbs: 28.4, sugar: 26.5, fiber: 0.8, na: 232, ca: 400, k: 540, p: 300, mg: 28, zn: 1.0, fe: 0.4, servingValue: 400 },
  { id: "added-milk-06", name: "林鳳營全脂鮮乳 200ml", category: "全脂乳品類", kcal: 131, protein: 6.4, fat: 7.4, satFat: 4.8, cholesterol: 22, carbs: 9.6, sugar: 9.6, na: 90, ca: 220, k: 300, p: 180, mg: 20, zn: 0.8, fe: 0.1, servingValue: 200 },
  { id: "added-milk-07", name: "克寧100%純生乳奶粉 (36g/份)", category: "全脂乳品類", kcal: 177, protein: 8.5, fat: 9.2, satFat: 5.8, transFat: 0.3, cholesterol: 28, carbs: 15.1, sugar: 15.1, na: 108, ca: 290, k: 380, p: 210, mg: 25, zn: 0.9, fe: 0.2, servingValue: 36 },
  { id: "added-milk-08", name: "克寧100%純脫脂奶粉 (28g/份)", category: "脫脂乳品類", kcal: 101, protein: 9.4, fat: 0.3, satFat: 0.2, cholesterol: 2, carbs: 15.1, sugar: 15.1, na: 109, ca: 335, k: 440, p: 245, mg: 30, zn: 1.1, fe: 0.1, servingValue: 28 },
  { id: "added-milk-09", name: "克寧高鈣雙效(葡萄糖胺+Omega 3) 245ml", category: "脫脂乳品類", kcal: 146, protein: 9.8, fat: 4.6, satFat: 2.8, cholesterol: 6, carbs: 16.4, sugar: 14.8, fiber: 1.2, na: 108, ca: 320, k: 441, p: 262, mg: 28, zn: 1.0, fe: 0.3, servingValue: 245 },
  { id: "added-milk-13", name: "低脂起司片 2片", category: "低脂乳品類", kcal: 120, protein: 8, fat: 4, satFat: 2.6, transFat: 0.1, cholesterol: 12, carbs: 12, sugar: 1.5, na: 320, ca: 240, k: 60, p: 150, mg: 12, zn: 0.6, fe: 0.1, servingValue: 40 },
  { id: "added-milk-14", name: "低脂牛奶 240 cc", category: "低脂乳品類", kcal: 120, protein: 8, fat: 4, satFat: 2.5, cholesterol: 12, carbs: 12, sugar: 11.5, na: 115, ca: 280, k: 360, p: 210, mg: 24, zn: 0.9, fe: 0.1, servingValue: 240 },
  { id: "added-milk-15", name: "優格 180g", category: "低脂乳品類", kcal: 200, protein: 8, fat: 4, satFat: 2.4, cholesterol: 15, carbs: 32, sugar: 24, fiber: 0.5, na: 90, ca: 220, k: 280, p: 180, mg: 18, zn: 0.8, fe: 0.1, servingValue: 180 },
  { id: "added-milk-16", name: "植物の優鮮美橘瓣優格 200g", category: "低脂乳品類", kcal: 180, protein: 7, fat: 4.4, satFat: 2.8, cholesterol: 10, carbs: 28.2, sugar: 22.4, fiber: 0.6, na: 56, ca: 200, k: 240, p: 160, mg: 16, zn: 0.7, fe: 0.1, servingValue: 200 },
  { id: "added-milk-17", name: "無糖優酪乳 200cc", category: "低脂乳品類", kcal: 180, protein: 8, fat: 4, satFat: 2.4, cholesterol: 12, carbs: 27, sugar: 12.5, fiber: 1.0, na: 110, ca: 240, k: 310, p: 190, mg: 20, zn: 0.8, fe: 0.1, servingValue: 200 },
  { id: "added-milk-18", name: "711 AB優洛乳（無加糖） 517ml", category: "低脂乳品類", kcal: 298, protein: 16, fat: 6.8, satFat: 4.1, cholesterol: 10, carbs: 43.4, sugar: 28.4, fiber: 8.8, na: 268, ca: 517, k: 620, p: 410, mg: 51.7, zn: 1.5, fe: 0.2, servingValue: 517 },
  { id: "added-milk-19", name: "711 AB優洛乳（原味） 517ml", category: "低脂乳品類", kcal: 310, protein: 15.6, fat: 3.2, satFat: 2.1, cholesterol: 12, carbs: 54.8, sugar: 48.5, fiber: 0.5, na: 268, ca: 517, k: 620, p: 410, mg: 51.7, zn: 1.4, fe: 0.2, servingValue: 517 },
  { id: "added-milk-20", name: "馬修嚴選 綜合莓優格百匯 125g", category: "低脂乳品類", kcal: 150, protein: 3.4, fat: 3.5, satFat: 2.1, cholesterol: 8, carbs: 26.1, sugar: 18.5, fiber: 1.8, na: 70, ca: 110, k: 160, p: 100, mg: 15, zn: 0.5, fe: 0.4, servingValue: 125 },
  { id: "added-milk-21", name: "鮮乳坊 真優格-豐樂牧場鮮乳優格 450g", category: "低脂乳品類", kcal: 296.1, protein: 15.9, fat: 17.1, satFat: 11.2, cholesterol: 35, carbs: 19.8, sugar: 18.9, na: 170, ca: 450, k: 620, p: 380, mg: 45, zn: 1.8, fe: 0.2, servingValue: 450 },
  { id: "added-milk-22", name: "鮮乳坊 真優格-每日爽快 300g", category: "低脂乳品類", kcal: 226.8, protein: 9.3, fat: 11.4, satFat: 7.5, cholesterol: 24, carbs: 27.7, sugar: 26.1, fiber: 0.2, na: 120, ca: 300, k: 420, p: 250, mg: 30, zn: 1.1, fe: 0.3, servingValue: 300 },
  { id: "added-milk-10", name: "克寧UC-II優蛋白配方 (43g/包) 245ml", category: "保健品類", kcal: 166, protein: 12, fat: 2.3, satFat: 1.4, cholesterol: 4, carbs: 24.3, sugar: 21.6, fiber: 0.8, na: 151, ca: 350, k: 258, p: 280, mg: 24, zn: 0.8, fe: 0.5, servingValue: 245 },
  { id: "added-milk-11", name: "克寧穩均含鉻 (38g/份)200ml", category: "保健品類", kcal: 101, protein: 8.8, fat: 1.8, satFat: 1.1, cholesterol: 3, carbs: 20.7, sugar: 18.5, fiber: 1.5, na: 93, ca: 280, k: 350, p: 200, mg: 22, zn: 0.9, fe: 0.4, servingValue: 200 },
  { id: "added-milk-12", name: "安怡 優蛋白Ex 200ml", category: "保健品類", kcal: 145, protein: 15, fat: 1.5, satFat: 0.9, cholesterol: 5, carbs: 18.3, sugar: 16.2, fiber: 1.0, na: 70, ca: 400, k: 380, p: 150, mg: 25, zn: 1.0, fe: 0.8, servingValue: 200 },
  { id: "added-milk-04", name: "福樂超能蛋白營養牛乳(草莓口味) 375ml", category: "外食類", kcal: 208, protein: 21.8, fat: 1.1, satFat: 0.7, cholesterol: 6, carbs: 27.8, sugar: 25.4, fiber: 0.4, na: 229.5, ca: 380, k: 480, p: 260, mg: 25, zn: 0.9, fe: 0.2, servingValue: 375 },
  { id: "added-milk-05", name: "福樂超能蛋白營養牛乳(堅果可可口味) 375ml", category: "外食類", kcal: 205, protein: 21.4, fat: 2.6, satFat: 1.5, cholesterol: 8, carbs: 24, sugar: 21.5, fiber: 1.2, na: 276.4, ca: 380, k: 520, p: 280, mg: 30, zn: 1.1, fe: 0.5, servingValue: 375 },
  { id: "soy-milk-01", name: "高纖無糖豆漿", category: "飲料", kcal: 132, protein: 13.6, fat: 5.6, satFat: 0.8, carbs: 11.2, sugar: 0.8, fiber: 9.6, na: 48, ca: 88, k: 480, p: 192, mg: 48, zn: 0.8, fe: 2.0, servingValue: 400 },
  { id: "tomato-mackerel-01", name: "番茄汁鯖魚罐頭", category: "即食與熟食", kcal: 213, protein: 23.4, fat: 11.1, satFat: 3.3, cholesterol: 120, carbs: 4.8, sugar: 3.2, fiber: 0.5, na: 620, ca: 150, k: 380, p: 225, mg: 35, zn: 1.4, fe: 2.1, servingValue: 150 },
  { id: "sunflower-oil-01", name: "不飽和葵花油", category: "醬料", kcal: 82.8, protein: 0, fat: 9.2, satFat: 1.1, transFat: 0.1, carbs: 0, servingValue: 10 },

  // --- 使用者新錄入食品 1 - 50+ 筆 (豆、魚、蛋、肉、全穀及外食套餐) ---
  { name: "統一陽光 無加糖超優蛋白豆漿 375ml", category: "低脂豆魚蛋肉類", carbs: 12.8, protein: 20.6, fat: 11.6, kcal: 231, na: 38 },
  { name: "光泉燕麥高纖無加糖鮮豆漿 450ml", category: "低脂豆魚蛋肉類", carbs: 72, protein: 57.6, fat: 32.4, kcal: 738, na: 648 },
  { name: "宜蘭有機豆漿 245ml", category: "低脂豆魚蛋肉類", carbs: 10, protein: 7.4, fat: 3.2, kcal: 98.2, na: 0 },
  { name: "羅董特濃低糖台灣豆奶 245ml", category: "低脂豆魚蛋肉類", carbs: 8.8, protein: 8.6, fat: 3.9, kcal: 105, na: 0 },
  { name: "羅董特濃無加糖台灣青仁黑豆奶 245ml", category: "低脂豆魚蛋肉類", carbs: 3.9, protein: 10.3, fat: 3.4, kcal: 88, na: 0 },
  { name: "中華花生豆花 150g (1盒）", category: "中脂豆魚蛋肉類", carbs: 18, protein: 2.4, fat: 1.5, kcal: 95, na: 12 },
  { name: "中華水果豆花 150g (1盒）", category: "中脂豆魚蛋肉類", carbs: 18, protein: 2.1, fat: 1.1, kcal: 90, na: 12 },
  { name: "義美厚豆花 160g (1盒）", category: "中脂豆魚蛋肉類", carbs: 13.2, protein: 5.8, fat: 3.8, kcal: 106, na: 11.5 },
  { name: "羅董五穀飲 245ml", category: "全榖雜糧類", carbs: 21.8, protein: 2, fat: 1.47, kcal: 108, na: 0 },
  { name: "羅董有機糙米奶 245ml", category: "全榖雜糧類", carbs: 17.2, protein: 1.2, fat: 0, kcal: 73.6, na: 0 },
  { name: "Costco 愛之味 純濃燕麥 340ml (1瓶) ", category: "油脂與堅果類", carbs: 28.2, protein: 4.8, fat: 3.4, kcal: 153.8, na: 68, k: 105.4 },
  { name: "Costco 桂格 減糖黑十穀 38g (1包) ", category: "油脂與堅果類", carbs: 28, protein: 2.3, fat: 5.5, kcal: 166, na: 45 },
  { name: '味全 紅龍檸檬雞柳條 50g(條)', category: '中脂豆魚蛋肉類', carbs: 7.8, protein: 6, fat: 7.5, kcal: 123, na: 191, k: '', p: '' },
  { name: "芝初 純黑芝麻醬 10g", category: "油脂與堅果類", carbs: 1.4, protein: 2.2, fat: 5.9, kcal: 67.5, na: 1 },
  { name: "純黑芝麻醬 20g", category: "油脂與堅果類", carbs: 3.2, protein: 4.3, fat: 11.5, kcal: 131.7, na: 0 },
  { name: "Costco 馬玉山 特濃核桃黑芝麻糊 37g (1包) ", category: "油脂與堅果類", carbs: 25.8, protein: 4.6, fat: 4.8, kcal: 158, na: 3, k: 92 },
  { name: "統一木瓜牛奶 478cc", category: "外食類", carbs: 47.3, protein: 9.1, fat: 8.6, kcal: 303, na: 277 },
  { name: "蘿蔔糕(香菇蝦米) (1塊)", category: "外食類", carbs: 18.8, protein: 2.5, fat: 2.8, kcal: 110, na: 0, servingValue: 50 },
  { name: "柳橙汁(100%)", category: "飲品", carbs: 10.7, protein: 0.6, fat: 0.3, kcal: 48, na: 7.8, k: 179.9, p: 12.4, servingValue: 100 },
  { name: "蘋果汁(100%)", category: "飲品]", carbs: 12.2, protein: 0.1, fat: 0.2, kcal: 51, na: 1.3, k: 96.2, p: 6.5, servingValue: 100 },
  { name: "享活 雪銀耳露 350ml", category: "外食類", carbs: 15.4, protein: 0, fat: 0, kcal: 61.6, na: 35, k: 0, p: 0 },
  { name: "享活 黑木耳露 350ml", category: "外食類", carbs: 19.6, protein: 0, fat: 0, kcal: 81.9, na: 0, k: 0, p: 0 },
  { name: "泰山 紫米紅豆湯 330g", category: "外食類", carbs: 59.7, protein: 10.6, fat: 1.3, kcal: 293, na: 40, k: 0, p: 0 },
  { name: "泰山 仙草蜜 330g", category: "外食類", carbs: 25, protein: 0, fat: 0, kcal: 100, na: 139, k: 0, p: 0 },
  { name: "泰山 花生仁湯 320g", category: "外食類", carbs: 46.7, protein: 7.4, fat: 12.2, kcal: 326, na: 114.6, k: 0, p: 0 },
  { name: "泰山 八寶粥 375g", category: "外食類", carbs: 60.4, protein: 6, fat: 0.4, kcal: 269, na: 57, k: 0, p: 0 },
  { name: "愛之味 牛奶花生 340g", category: "外食類", carbs: 16.7, protein: 6.5, fat: 12.8, kcal: 280, na: 56, k: 0, p: 0 },
  { name: "大茂 大土豆麵筋易開 170g", category: "外食類", carbs: 4, protein: 4, fat: 5, kcal: 71, na: 185, k: 0, p: 0 },
  { name: "仙草蜜", category: "外食類", carbs: 8.8, protein: 0, fat: 0, kcal: 35, na: 48, k: 15, p: 1 },
  { name: "麥茶", category: "外食類", carbs: 4.4, protein: 0, fat: 0, kcal: 18, na: 18, k: 8.9, p: 5.9 },
  { name: "可樂", category: "外食類", carbs: 12.8, protein: 0, fat: 0, kcal: 51, na: 6.6, k: 0, p: 15.8 },
  { name: "可樂(低熱量)", category: "外食類", carbs: 0.3, protein: 0, fat: 0, kcal: 1, na: 9.6, k: 0, p: 7.9 },
  { name: "美式咖啡(無糖)", category: "外食類", carbs: 0.3, protein: 0.2, fat: 0.1, kcal: 3, na: 1.7, k: 62.1, p: 4 },
  { name: "拿鐵咖啡(無糖)", category: "外食類", carbs: 3.4, protein: 3, fat: 2, kcal: 44, na: 28.3, k: 176.1, p: 81.2 },
  { name: "咖啡(三合一)", category: "外食類", carbs: 8.2, protein: 0.9, fat: 0.4, kcal: 40, na: 25.1, k: 75, p: 20.8 },
  { name: "鮮奶茶(無糖)", category: "外食類", carbs: 1.4, protein: 2, fat: 1.4, kcal: 26, na: 11.9, k: 61.6, p: 27.7 },
  { name: "奶茶(三合一)", category: "外食類", carbs: 9.5, protein: 0.5, fat: 0.3, kcal: 43, na: 18, k: 34.7, p: 18.1 },
  { name: "新養樂多活菌發酵乳", category: "外食類", carbs: 17, protein: 1.6, fat: 0, kcal: 64.3, na: 18, k: 34.7, p: 18.1 },
  { name: "711聖德科斯芭樂檸檬汁280ml", category: "外食類", carbs: 33.6, protein: 0.6, fat: 0.3, kcal: 137.5, na: 16 },
  { name: "Costco 韓味不二 鹽烤海苔 5g", category: "外食類", carbs: 1.8, protein: 0.5, fat: 2.3, kcal: 29.9, na: 96 },
  { name: "Costco Kokiri 哇象海苔捲原味 5g", category: "外食類", carbs: 4, protein: 1, fat: 0, kcal: 20, na: 75 },
  { name: "元本山 味付對切海苔 23.7g", category: "外食類", carbs: 10.2, protein: 9.3, fat: 0.9, kcal: 72, na: 318 },
  { name: "Costco 奇多 隨口脆玉米脆 28g(起司)", category: "外食類", carbs: 15.7, protein: 2, fat: 9.8, kcal: 159, na: 206 },
  { name: "Costco 奇多 隨口脆玉米脆 28g（雞汁）", category: "外食類", carbs: 15.7, protein: 1.5, fat: 9.5, kcal: 155, na: 178 },
  { name: "Costco 北海 鱈魚香絲 青花椒辣味 30g", category: "外食類", carbs: 16.3, protein: 7.4, fat: 0.3, kcal: 97.8, na: 553.6 },
  { name: "好丘-原味小麥貝果 100g (1個)", category: "外食類", carbs: 53.1, protein: 9.6, fat: 5, kcal: 291, na: 498 },
  { name: "好丘-芋頭鹹蛋黃貝果 120g (1個)", category: "外食類", carbs: 59.6, protein: 9.6, fat: 6.4, kcal: 334.8, na: 442 },
  { name: "好丘-草莓奶香貝果 120g (1個)", category: "外食類", carbs: 64.8, protein: 10, fat: 5.8, kcal: 345.6, na: 508 },
  { name: "好丘-地瓜乳酪貝果 116g (1個)", category: "外食類", carbs: 58.2, protein: 9.4, fat: 3.8, kcal: 305, na: 500 },
  { name: "好丘-起司三重奏貝果 120g (1個)", category: "外食類", carbs: 55, protein: 14.6, fat: 8.2, kcal: 349.2, na: 656 },
  { name: "好丘-花生可可貝果 120g (1個)", category: "外食類", carbs: 55.2, protein: 14.6, fat: 18.2, kcal: 434.2, na: 424 },
  { name: "好丘-野生桑葚貝果 105g (1個)", category: "外食類", carbs: 60.9, protein: 9.7, fat: 2.1, kcal: 301, na: 508.2 },
  { name: "好丘-四季春貝果 105g (1個)", category: "外食類", carbs: 59.1, protein: 10, fat: 1.2, kcal: 286.7, na: 506.1 },
  { name: "鍋燒雞絲麵(當歸口味) 55g(1份)", category: "外食類", carbs: 33.6, protein: 6.8, fat: 11.3, kcal: 262.9, na: 1210 },
  { name: "八方雲集-招牌水餃 28g (1顆)", category: "外食類", carbs: 5.35, protein: 2.16, fat: 2.97, kcal: 56.73, na: 934.1 },
  { name: "八方雲集-韭菜水餃 28g (1顆)", category: "外食類", carbs: 4.85, protein: 2.43, fat: 3.24, kcal: 58.28, na: 806.9 },
  { name: "八方雲集-韓式辣味水餃 28g (1顆)", category: "外食類", carbs: 6.55, protein: 2.24, fat: 2.23, kcal: 55.27, na: 135.8 },
  { name: "八方雲集-咖哩水餃 28g (1顆)", category: "外食類", carbs: 4.2, protein: 2.44, fat: 2.74, kcal: 51.24, na: 107.44 },
  { name: "八方雲集-玉米水餃 28g (1顆)", category: "外食類", carbs: 5.9, protein: 1.7, fat: 1.8, kcal: 46.64, na: 88.93 },
  { name: "八方雲集-新蔬食水餃 28g (1顆)", category: "外食類", carbs: 6.66, protein: 2.32, fat: 1.96, kcal: 53.59, na: 98.31 },
  { name: "八方雲集-鮮蝦水餃 28g (1顆)", category: "外食類", carbs: 5.12, protein: 2.07, fat: 2.55, kcal: 51.72, na: 109.17 },
  { name: "池上便當 - 蒜蒜紅石班飯包", category: "外食類", carbs: 95, protein: 30.2, fat: 12.4, kcal: 613, na: 952 },
  { name: "池上便當 - 鹽的花魚飯包", category: "外食類", carbs: 96.7, protein: 37.6, fat: 16.3, kcal: 691, na: 463 },
  { name: "池上便當 - 油上油雞飯包", category: "外食類", carbs: 97.6, protein: 31.9, fat: 13.9, kcal: 643, na: 933 },
  { name: "池上便當 - 雞滷飯", category: "外食類", carbs: 98.2, protein: 35.9, fat: 32.3, kcal: 828, na: 740 },
  { name: "池上便當 - 經典池上飯包", category: "外食類", carbs: 103.4, protein: 35.3, fat: 20.7, kcal: 742, na: 1085 },
  { name: "池上便當 - 炭火烤肉飯包", category: "外食類", carbs: 102.9, protein: 29, fat: 13.4, kcal: 648, na: 881 },
  { name: "池上便當 - 黃金豬排飯包", category: "外食類", carbs: 117.7, protein: 33.2, fat: 16.2, kcal: 749, na: 1139 },
  { name: "池上便當 - 悟饕經典排骨飯包", category: "外食類", carbs: 107.8, protein: 31.5, fat: 18.1, kcal: 720, na: 843 },
  { name: "池上便當 - 鐵道排骨飯包", category: "外食類", carbs: 108.2, protein: 29.2, fat: 21.4, kcal: 742, na: 999 },
  { name: "池上便當 - 土雞肉飯", category: "外食類", carbs: 95.2, protein: 30.5, fat: 29.5, kcal: 768, na: 762 },
  { name: "池上便當 - 椒來麻雞腿飯包", category: "外食類", carbs: 103.3, protein: 59, fat: 26.3, kcal: 886, na: 1321 },
  { name: "池上便當 - 香酥雞腿飯包", category: "外食類", carbs: 97.7, protein: 62.3, fat: 29.3, kcal: 904, na: 782 },
  { name: "池上便當 - 悟厚大G排飯包", category: "外食類", carbs: 146.1, protein: 65.9, fat: 14.1, kcal: 975, na: 1589 },
  { name: "池上便當 - 蒲燒鯛魚飯包", category: "外食類", carbs: 99, protein: 28, fat: 38.6, kcal: 855, na: 1036 },
  { name: "池上便當 - 養生飯包", category: "外食類", carbs: 119.5, protein: 33, fat: 10.6, kcal: 705, na: 442 },
  { name: "池上便當 - 灶咖豬排飯包", category: "外食類", carbs: 102.5, protein: 30, fat: 10.7, kcal: 626, na: 933 },
  { name: "池上便當 - 雙醬咖哩豚丼", category: "外食類", carbs: 102.5, protein: 22.3, fat: 20.6, kcal: 685, na: 647 },
  { name: "池上便當 - 台式炕肉飯包", category: "外食類", carbs: 107.4, protein: 33.6, fat: 27.5, kcal: 812, na: 1100 },
  { name: "池上便當 - 蒜香雞菲力飯包", category: "外食類", carbs: 116.5, protein: 38.8, fat: 15.5, kcal: 723, na: 690 },
  { name: "池上便當 - 薄鹽鯖魚飯包", category: "外食類", carbs: 99.7, protein: 36.4, fat: 16.4, kcal: 692, na: 696 },
  { name: "統一杏仁茶 450ml", category: "外食類", carbs: 37.8, protein: 2.7, fat: 6.3, kcal: 219, na: 68 },
  { name: "天素地蔬 陽明春天菇菇毛豆飯糰 110g", category: "外食類", carbs: 35.3, protein: 4.4, fat: 4.8, kcal: 202, na: 420 },
  { name: "天素地蔬 塔香杏鮑菇飯糰 110g", category: "外食類", carbs: 39.2, protein: 3.8, fat: 4.2, kcal: 210, na: 437 },
  { name: "天素地蔬 陽明春天野菇炊飯飯糰 110g", category: "外食類", carbs: 39.5, protein: 3.9, fat: 3.9, kcal: 209, na: 525 },
  { name: "711阜杭豆漿里肌肉紫米飯糰 207g", category: "外食類", carbs: 65.6, protein: 12.8, fat: 12, kcal: 422, na: 511 },
  { name: "711星級饗宴-麻油雞飯糰 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711新極上飯糰-天使紅蝦 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711新極上飯糰-蔥鹽生鮭 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 210, na: 0 },
  { name: "711新極上飯糰-明太子鮭魚 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 228, na: 0 },
  { name: "711新極上飯糰-冠軍烏魚子 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711星宇新極上-胡同炭火牛小排 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711嫩烤里肌多彩便當 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711極饗-沙茶豬肉燴飯 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711黑金松露嫩雞胸 207g", category: "外食類", carbs: 0, protein: 0, fat: 0, kcal: 354, na: 0 },
  { name: "711糖心蛋紐奧良風味烤雞 三明治 117g", category: "外食類", carbs: 20.7, protein: 15.3, fat: 10.1, kcal: 235, na: 668 },
  { name: "711香檸優多 椰果晶凍 400g", category: "外食類", carbs: 52, protein: 0.4, fat: 0, kcal: 210, na: 176 },
  { name: "711比菲多（寡糖配方）471ml", category: "外食類", carbs: 60.3, protein: 6.2, fat: 0, kcal: 198, na: 89 },
  { name: "711比菲多（減醣30%）471ml", category: "外食類", carbs: 67.8, protein: 5.2, fat: 0, kcal: 278, na: 52 },
  { name: "711寒天冬瓜檸檬QQ 400g", category: "外食類", carbs: 51, protein: 0.4, fat: 0.4, kcal: 208, na: 73 },
  { name: "Qburger黃金脆雞鮮蔬堡 152g", category: "外食類", carbs: 6.1, protein: 17, fat: 9, kcal: 171.5, na: 205 },
  { name: "Qburger里肌豬排堡 158g", category: "外食類", carbs: 38.1, protein: 14, fat: 11.9, kcal: 314.9, na: 762 },
  { name: "Qburger牛肉起士漢堡 174g", category: "外食類", carbs: 35.6, protein: 15, fat: 24.1, kcal: 418.3, na: 639 },
  { name: "Qburger卡啦雞腿漢堡 207g", category: "外食類", carbs: 46.4, protein: 21.9, fat: 33.4, kcal: 572.7, na: 976 },
  { name: "Qburger麥香雞漢堡 157g", category: "外食類", carbs: 42.1, protein: 10.2, fat: 19.4, kcal: 383.6, na: 756 },
  { name: "Qburger黃金脆雞堡 177g", category: "外食類", carbs: 35.5, protein: 21.8, fat: 14.2, kcal: 356.8, na: 492 },
  { name: "Qburger鮪魚吐司 168g", category: "外食類", carbs: 50.2, protein: 14.4, fat: 22, kcal: 455.8, na: 557 },
  { name: "Qburger里肌豬排吐司 175g", category: "外食類", carbs: 51.8, protein: 17.2, fat: 16.1, kcal: 420.3, na: 831 },
  { name: "Qburger花生吐司 108g", category: "外食類", carbs: 49.1, protein: 11.2, fat: 12.8, kcal: 356.7, na: 368 },
  { name: "Qburger鮪魚蛋餅 182g", category: "外食類", carbs: 31.2, protein: 19.7, fat: 26.3, kcal: 439.6, na: 824 },
  { name: "Qburger黑胡椒麵鐵板麵 563g", category: "外食類", carbs: 75, protein: 26.2, fat: 19.6, kcal: 581.3, na: 1662 },
  { name: "Qburger蘑菇麵鐵板麵 563g", category: "外食類", carbs: 64.3, protein: 25.9, fat: 18.5, kcal: 527, na: 1707 },
  { name: "Qburger沙茶麵鐵板麵 549g", category: "外食類", carbs: 90.3, protein: 28, fat: 22.7, kcal: 677.4, na: 2396 },
  { name: "Qburger原味蛋餅 132g", category: "外食類", carbs: 29, protein: 11.8, fat: 10, kcal: 253.4, na: 657 },
  { name: "Qburger100%肉鬆蛋餅 147g", category: "外食類", carbs: 33.1, protein: 15.8, fat: 16.1, kcal: 340.5, na: 803 },
  { name: "Qburger經典紅茶 320g", category: "外食類", carbs: 27.1, protein: 0, fat: 0, kcal: 108.4, na: 0 },
  { name: "Qburger美式黑咖啡 340g", category: "外食類", carbs: 2.38, protein: 0.68, fat: 0.34, kcal: 3.4, na: 3 },
  { name: "Qburger拿鐵咖啡 345g", category: "外食類", carbs: 8, protein: 5.5, fat: 5.7, kcal: 105.5, na: 90 },
  { name: "Qburger招牌奶茶 320g", category: "外食類", carbs: 34.7, protein: 1, fat: 2, kcal: 320, na: 14 },
  { name: "Qburger柳橙汁 300g", category: "外食類", carbs: 33.9, protein: 1.5, fat: 0, kcal: 141.6, na: 60 },
  { name: "Qburger阿華田 360g", category: "外食類", carbs: 33.9, protein: 1.5, fat: 0, kcal: 141.6, na: 60 },
  { name: "Qburger100%肉鬆可朗芙 75g", category: "外食類", carbs: 25.8, protein: 7.2, fat: 20.2, kcal: 311.3, na: 358 },
  { name: "Qburger蜂蜜芥末卡啦雞可朗芙 199g", category: "外食類", carbs: 37.6, protein: 21.4, fat: 42.1, kcal: 612.7, na: 977 },
  { name: "Qburger鮪魚玉米可朗芙 123g", category: "外食類", carbs: 25.9, protein: 10.6, fat: 21.4, kcal: 336, na: 376 },
  { name: "Qburger經典可朗芙 55g", category: "外食類", carbs: 21.7, protein: 4.4, fat: 8.8, kcal: 181.8, na: 235 },
  { name: "Qburger花醬可朗芙 72g", category: "外食類", carbs: 26.3, protein: 7.5, fat: 17.1, kcal: 287.5, na: 276 },

  // --- 使用者新增洋芋片、休閒點心、機能補充營養品系列 ---
  { name: "品客 起司洋芋片 48g(小罐裝)", category: "零食", carbs: 28.7, protein: 2.3, fat: 14.8, kcal: 257, na: 700, k: "", p: "" },
  { name: "品客 原味洋芋片 48g(小罐裝)", category: "零食", carbs: 30.2, protein: 2.4, fat: 13.4, kcal: 248, na: 226, k: "", p: "" },
  { name: "品客 原味洋芋片 102g(大罐裝)", category: "零食", carbs: 64, protein: 5.2, fat: 28.4, kcal: 524, na: 480, k: "", p: "" },
  { name: "樂事 原味洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 47, protein: 4.25, fat: 27, kcal: 447.5, na: 390, k: "", p: "" },
  { name: "樂事 雞汁洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 47, protein: 4.25, fat: 27, kcal: 447.5, na: 455, k: "", p: "" },
  { name: "樂事 海苔壽司洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 48.5, protein: 4.25, fat: 26.5, kcal: 450, na: 485, k: "", p: "" },
  { name: "樂事 奶焗香蔥洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 48.5, protein: 4.25, fat: 27.5, kcal: 457.5, na: 442.5, k: "", p: "" },
  { name: "樂事 蜜汁香烤肋排洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 47.3, protein: 5.25, fat: 27.3, kcal: 455, na: 477.5, k: "", p: "" },
  { name: "樂事 A5和牛洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 48.3, protein: 4.5, fat: 27.3, kcal: 457.5, na: 507.5, k: "", p: "" },
  { name: "樂事 日式串燒洋芋片 83g/袋(2袋裝)", category: "零食", carbs: 48.3, protein: 4.5, fat: 27.3, kcal: 457.5, na: 480, k: "", p: "" },
  { name: "樂事 原味洋芋片 84.9g/袋(袋裝)", category: "零食", carbs: 46.2, protein: 6, fat: 30.6, kcal: 486, na: 498, k: "", p: "" },
  { name: "樂事 九州岩燒海苔洋芋片 84.9g/袋(袋裝)", category: "零食", carbs: 46.8, protein: 6, fat: 29.7, kcal: 480, na: 498, k: "", p: "" },
  { name: "樂事 香濃起司洋芋片 84.9g/袋(袋裝)", category: "零食", carbs: 45.9, protein: 5.7, fat: 30.6, kcal: 480, na: 591, k: "", p: "" },
  { name: "樂事 奶焗香蔥洋芋片 69.9g/袋(袋裝)", category: "零食", carbs: 37.5, protein: 4.5, fat: 24.9, kcal: 393, na: 432, k: "", p: "" },
  { name: "樂事 香酥雞腿洋芋片 84.9g/袋(袋裝)", category: "零食", carbs: 47.4, protein: 6, fat: 29.7, kcal: 480, na: 468, k: "", p: "" },
  { name: "樂事 自然美味 薄切紫地瓜片 78.9g/袋(袋裝)", category: "零食", carbs: 48, protein: 2.1, fat: 26.7, kcal: 441, na: 285, k: "", p: "" },
  { name: "樂事 自然美味 薄切地瓜片 78.9g/袋(袋裝)", category: "零食", carbs: 49.2, protein: 6, fat: 26.1, kcal: 441, na: 393, k: "", p: "" },
  { name: "樂事 自然美味 薄鹽海苔 69.9g/袋(袋裝)", category: "零食", carbs: 39.6, protein: 4.5, fat: 23.7, kcal: 390, na: 168, k: "", p: "" },
  { name: "樂事 自然美味 海鹽 69.9g/袋(袋裝)", category: "零食", carbs: 37.2, protein: 4.2, fat: 25.8, kcal: 399, na: 372, k: "", p: "" },
  { name: "樂天小熊餅乾-草莓 48g(小包裝)", category: "零食", carbs: 29.9, protein: 2, fat: 14.1, kcal: 254.5, na: 116, k: "", p: "" },
  { name: "Lindt EXCELLENCE 100% 黑巧克力 50g(21塊)", category: "外食類", carbs: 13.5, protein: 6.5, fat: 27, kcal: 310, na: 5, k: "", p: "" },
  { name: "VANINI 100% 醇黑可可製品 90g(21塊)", category: "外食類", carbs: 24.3, protein: 12.6, fat: 46.8, kcal: 543.6, na: 18, k: "", p: "" },
  { name: "亞培 腎補納/未洗腎 237ml", category: "保健品", carbs: 46.4, protein: 10.6, fat: 22.7, kcal: 432, na: 190, k: 270, p: 170 },
  { name: "艾益生 力增10%/未洗腎 237ml", category: "保健品", carbs: 46.4, protein: 10.6, fat: 22.7, kcal: 432, na: 190, k: 200, p: 170 },
  { name: "補體素 慎選/未洗腎 237ml", category: "保健品", carbs: 52.8, protein: 10.8, fat: 22.5, kcal: 457, na: 236, k: 300, p: 188 },
  { name: "三多補體康 低蛋白", category: "保健品", carbs: 51.8, protein: 8.5, fat: 21.3, kcal: 433, na: 190, k: 240, p: 170 },
  { name: "卡比 倍速力 200ml", category: "保健品", carbs: 55.2, protein: 6, fat: 17.8, kcal: 405, na: 136, k: 200, p: 110 },
  { name: "立攝適 盛健 10% 250ml", category: "保健品", carbs: 47.5, protein: 23, fat: 25, kcal: 507, na: 235, k: 205, p: 220 },
  { name: "三多勝補康LPF-N (2平匙,250cc)", category: "保健品", carbs: 36.6, protein: 5.9, fat: 9.7, kcal: 257, na: 105, k: 107, p: 74.3 },
  { name: "益富 益能充 45g/包", category: "保健品", carbs: 31.8, protein: 0.8, fat: 8.2, kcal: 204, na: 113, k: 108, p: 42 },
  { name: "補體素 慎選 45g/包", category: "保健品", carbs: 32.2, protein: 0.6, fat: 8.5, kcal: 208, na: 44, k: 90.9, p: 38.7 },
  { name: "亞培 葡勝納3重強護 52g/5匙", category: "保健品", carbs: 30.4, protein: 10.2, fat: 8.3, kcal: 237, na: 211, k: 370, p: 168 },
  { name: "思耐得 補體素鉻100 58g/5匙", category: "保健品", carbs: 31.3, protein: 12.8, fat: 9.5, kcal: 262, na: 220, k: 229, p: 165 },
  { name: "維維樂 加倍優糖尿病配方 40g/包", category: "保健品", carbs: 25.7, protein: 8.2, fat: 5.2, kcal: 182, na: 104, k: 257, p: 212 },
  { name: "益富 益力壯糖尿病配方 58g/7匙", category: "保健品", carbs: 28.7, protein: 12.6, fat: 10.5, kcal: 260, na: 262, k: 249, p: 134 },
  { name: "桂格 完膳糖尿病配方 60g/7匙", category: "保健品", carbs: 32.4, protein: 12, fat: 8, kcal: 250, na: 265, k: 260, p: 385 },
  { name: "亞培 葡勝納SR 200ml", category: "保健品", carbs: 24.5, protein: 9.3, fat: 6.8, kcal: 196, na: 178, k: 312, p: 120 },
  { name: "艾益生 力增飲鉻100 237ml", category: "保健品", carbs: 28.2, protein: 10, fat: 10.8, kcal: 250, na: 240, k: 290, p: 175 },
  { name: "思耐得 補體素鉻100 237ml", category: "保健品", carbs: 29, protein: 12, fat: 9, kcal: 245, na: 194, k: 237, p: 160 },
  { name: "益富 益力壯鉻112 250ml", category: "保健品", carbs: 28.5, protein: 12.5, fat: 10.5, kcal: 259, na: 263, k: 406, p: 175 },
  { name: "賀寶芙 草莓 260ml", category: "保健品", carbs: 13, protein: 9, fat: 0.8, kcal: 88, na: 90, k: 284, p: "" },
  { name: "賀寶芙 薄荷巧克力 260ml", category: "保健品", carbs: 13, protein: 9, fat: 0.8, kcal: 88, na: 90, k: 284, p: "" },
  { name: "賀寶芙 香草 260ml", category: "保健品", carbs: 13, protein: 9, fat: 0.8, kcal: 88, na: 90, k: 284, p: "" },
  { name: "賀寶芙 巧克力 260ml", category: "保健品", carbs: 13, protein: 9, fat: 0.8, kcal: 88, na: 90, k: 438, p: "" },
  { name: "賀寶芙 巧餅 260ml", category: "保健品", carbs: 13, protein: 9, fat: 1, kcal: 90, na: 160, k: 284, p: "" },
  { name: "賀寶芙 拿鐵 260ml", category: "保健品", carbs: 13, protein: 9, fat: 0.8, kcal: 88, na: 95, k: 325, p: "" },
  { name: "賀寶芙 芒果 260ml", category: "保健品", carbs: 13, protein: 9, fat: 0.8, kcal: 88, na: 90, k: 284, p: "" }
];

// ============================================================================
// 3. 輸出映射與完整度校驗 (Public Exported Dataset)
// ============================================================================

export const INITIAL_FOODS: Omit<FoodItem, "history">[] = DENSE_FOOD_SOURCE.map((item, index) => {
  return parseDenseFood(item, index);
});
