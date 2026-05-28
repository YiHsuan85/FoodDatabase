/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 20MB limit for base64 photo uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const dbPath = path.join(process.cwd(), "foods-db.json");

// Admin password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Initial foods data to populate the db if it doesn't exist
const initialFoods = [
  {
    id: "viva-nuts-01",
    name: "無調味綜合果",
    brand: "萬歲牌",
    barcode: "4710022026362",
    category: "堅果種子",
    image: "", // Use CSS layout or category fallback if empty
    servingSizeText: "本包裝含28份，每份28公克",
    servingValue: 28,
    isLiquid: false,
    perServing: {
      energy: 181,
      protein: 4.8,
      fat: 15.6,
      saturatedFat: 1.8,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 5.4,
      sugar: 1.1,
      fiber: 2.2,
      sodium: 1,
      calcium: 32,
      potassium: 188,
      phosphorus: 120,
      magnesium: 51,
      zinc: 0.9,
      iron: 1.2
    },
    per100g: {
      energy: 646,
      protein: 17.1,
      fat: 55.7,
      saturatedFat: 6.4,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 19.3,
      sugar: 3.9,
      fiber: 7.9,
      sodium: 4,
      calcium: 114,
      potassium: 671,
      phosphorus: 429,
      magnesium: 182,
      zinc: 3.2,
      iron: 4.3
    },
    history: [
      {
        id: "h1",
        timestamp: "2026-05-28 14:00:00",
        action: "system_init",
        description: "系統預設載入台灣萬歲牌無調味綜合果營養數據。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "imei-milk-01",
    name: "低脂鮮乳",
    brand: "義美",
    barcode: "4712439121088",
    category: "乳製品",
    image: "",
    servingSizeText: "本包裝含1份，每份290毫升",
    servingValue: 290,
    isLiquid: true,
    perServing: {
      energy: 131,
      protein: 9.3,
      fat: 4.4,
      saturatedFat: 2.9,
      transFat: 0,
      cholesterol: 15,
      carbohydrate: 13.9,
      sugar: 13.9,
      fiber: 0,
      sodium: 122,
      calcium: 319,
      potassium: 435,
      phosphorus: 250,
      magnesium: 29,
      zinc: 1.1,
      iron: 0.1
    },
    per100g: {
      energy: 45,
      protein: 3.2,
      fat: 1.5,
      saturatedFat: 1.0,
      transFat: 0,
      cholesterol: 5.2,
      carbohydrate: 4.8,
      sugar: 4.8,
      fiber: 0,
      sodium: 42,
      calcium: 110,
      potassium: 150,
      phosphorus: 86,
      magnesium: 10,
      zinc: 0.38,
      iron: 0.03
    },
    history: [
      {
        id: "h2",
        timestamp: "2026-05-28 14:00:00",
        action: "system_init",
        description: "系統預設載入義美低脂鮮乳數據，高鈣高蛋白質。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "soy-milk-01",
    name: "高纖無糖豆漿",
    brand: "統一元氣種子",
    barcode: "4710088432138",
    category: "飲料",
    image: "",
    servingSizeText: "每一份量400毫升，本包裝含1份",
    servingValue: 400,
    isLiquid: true,
    perServing: {
      energy: 132,
      protein: 13.6,
      fat: 5.6,
      saturatedFat: 0.8,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 11.2,
      sugar: 0.8,
      fiber: 9.6,
      sodium: 48,
      calcium: 88,
      potassium: 480,
      phosphorus: 192,
      magnesium: 48,
      zinc: 0.8,
      iron: 2.0
    },
    per100g: {
      energy: 33,
      protein: 3.4,
      fat: 1.4,
      saturatedFat: 0.2,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 2.8,
      sugar: 0.2,
      fiber: 2.4,
      sodium: 12,
      calcium: 22,
      potassium: 120,
      phosphorus: 48,
      magnesium: 12,
      zinc: 0.2,
      iron: 0.5
    },
    history: [
      {
        id: "h3",
        timestamp: "2026-05-28 14:05:00",
        action: "system_init",
        description: "系統預設載入高纖無糖豆漿，高蛋白、低鈉、高纖營養數據。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "chicken-01",
    name: "即食雞胸肉-原味",
    brand: "卜蜂",
    barcode: "4710254005119",
    category: "肉類與蛋",
    image: "",
    servingSizeText: "每一份量100公克，本包裝含1份",
    servingValue: 100,
    isLiquid: false,
    perServing: {
      energy: 114,
      protein: 22.3,
      fat: 2.1,
      saturatedFat: 0.6,
      transFat: 0,
      cholesterol: 58,
      carbohydrate: 1.5,
      sugar: 0,
      fiber: 0,
      sodium: 412,
      calcium: 12,
      potassium: 250,
      phosphorus: 180,
      magnesium: 24,
      zinc: 0.8,
      iron: 0.4
    },
    per100g: {
      energy: 114,
      protein: 22.3,
      fat: 2.1,
      saturatedFat: 0.6,
      transFat: 0,
      cholesterol: 58,
      carbohydrate: 1.5,
      sugar: 0,
      fiber: 0,
      sodium: 412,
      calcium: 12,
      potassium: 250,
      phosphorus: 180,
      magnesium: 24,
      zinc: 0.8,
      iron: 0.4
    },
    history: [
      {
        id: "h4",
        timestamp: "2026-05-28 14:10:00",
        action: "system_init",
        description: "系統預設載入卜蜂即食雞胸肉營養數據，超高蛋白代表食品。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "quaker-oats-01",
    name: "即食燕麥片",
    brand: "桂格",
    barcode: "4710043024506",
    category: "穀物雜糧",
    image: "",
    servingSizeText: "每一份量37.5公克，本包裝含21份",
    servingValue: 37.5,
    isLiquid: false,
    perServing: {
      energy: 140,
      protein: 5.0,
      fat: 3.1,
      saturatedFat: 0.6,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 25.1,
      sugar: 0.4,
      fiber: 3.7,
      sodium: 1,
      calcium: 18,
      potassium: 131,
      phosphorus: 154,
      magnesium: 44,
      zinc: 1.1,
      iron: 1.5
    },
    per100g: {
      energy: 373,
      protein: 13.3,
      fat: 8.3,
      saturatedFat: 1.6,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 67.0,
      sugar: 1.1,
      fiber: 9.9,
      sodium: 2,
      calcium: 48,
      potassium: 350,
      phosphorus: 411,
      magnesium: 117,
      zinc: 2.9,
      iron: 4.0
    },
    history: [
      {
        id: "h5",
        timestamp: "2026-05-28 14:12:00",
        action: "system_init",
        description: "系統預設載入桂格即食燕麥片數據，兼含高纖維與礦物質鋅、鐵。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "taiwan-banana-01",
    name: "台灣當季香蕉",
    brand: "綠之園農產",
    barcode: "4712345670891",
    category: "當季水果",
    image: "",
    servingSizeText: "每一份量120公克，本包裝含1份",
    servingValue: 120,
    isLiquid: false,
    perServing: {
      energy: 102,
      protein: 1.3,
      fat: 0.2,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 26.4,
      sugar: 14.4,
      fiber: 3.1,
      sodium: 1,
      calcium: 6,
      potassium: 430,
      phosphorus: 26,
      magnesium: 32,
      zinc: 0.18,
      iron: 0.3
    },
    per100g: {
      energy: 85,
      protein: 1.1,
      fat: 0.17,
      saturatedFat: 0.08,
      transFat: 0,
      cholesterol: 0,
      carbohydrate: 22.0,
      sugar: 12.0,
      fiber: 2.6,
      sodium: 1,
      calcium: 5,
      potassium: 358,
      phosphorus: 22,
      magnesium: 27,
      zinc: 0.15,
      iron: 0.25
    },
    history: [
      {
        id: "h6",
        timestamp: "2026-05-28 14:15:00",
        action: "system_init",
        description: "系統預設載入台灣本土當季香蕉數據，富含微量元素鉀、鎂與膳食纖維。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "tomato-mackerel-01",
    name: "番茄汁鯖魚罐頭",
    brand: "同榮",
    barcode: "4710185011037",
    category: "即食與熟食",
    image: "",
    servingSizeText: "每一份量150公克，本包裝含1份",
    servingValue: 150,
    isLiquid: false,
    perServing: {
      energy: 213,
      protein: 23.4,
      fat: 11.1,
      saturatedFat: 3.3,
      transFat: 0,
      cholesterol: 120,
      carbohydrate: 4.8,
      sugar: 3.2,
      fiber: 0.5,
      sodium: 620,
      calcium: 150,
      potassium: 380,
      phosphorus: 225,
      magnesium: 35,
      zinc: 1.4,
      iron: 2.1
    },
    per100g: {
      energy: 142,
      protein: 15.6,
      fat: 7.4,
      saturatedFat: 2.2,
      transFat: 0,
      cholesterol: 80,
      carbohydrate: 3.2,
      sugar: 2.1,
      fiber: 0.33,
      sodium: 413,
      calcium: 100,
      potassium: 253,
      phosphorus: 150,
      magnesium: 23,
      zinc: 0.93,
      iron: 1.4
    },
    history: [
      {
        id: "h7",
        timestamp: "2026-05-28 14:18:00",
        action: "system_init",
        description: "系統預設載入同榮番茄鯖魚紅罐，豐富鈣質與鐵質，即食好選擇。",
        author: "系統初始化"
      }
    ]
  },
  {
    id: "sunflower-oil-01",
    name: "不飽和葵花油",
    brand: "泰山",
    barcode: "4710252110297",
    category: "醬料",
    image: "",
    servingSizeText: "每一份量10毫升，本包裝含200份",
    servingValue: 10,
    isLiquid: true,
    perServing: {
      energy: 82.8,
      protein: 0,
      fat: 9.2,
      saturatedFat: 1.1,
      transFat: 0.1,
      cholesterol: 0,
      carbohydrate: 0,
      sugar: 0,
      fiber: 0,
      sodium: 0,
      calcium: 0,
      potassium: 0,
      phosphorus: 0,
      magnesium: 0,
      zinc: 0,
      iron: 0
    },
    per100g: {
      energy: 828,
      protein: 0,
      fat: 92,
      saturatedFat: 11,
      transFat: 1.0,
      cholesterol: 0,
      carbohydrate: 0,
      sugar: 0,
      fiber: 0,
      sodium: 0,
      calcium: 0,
      potassium: 0,
      phosphorus: 0,
      magnesium: 0,
      zinc: 0,
      iron: 0
    },
    history: [
      {
        id: "h8",
        timestamp: "2026-05-28 14:20:00",
        action: "system_init",
        description: "系統預設載入泰山葵花籽油純油脂純度分析數據。",
        author: "系統初始化"
      }
    ]
  }
];

// Read database from file
function readDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(content);
    } else {
      writeDb(initialFoods);
      return initialFoods;
    }
  } catch (err) {
    console.error("Database read error, fallback to memory", err);
    return initialFoods;
  }
}

// Write database to file
function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Database write error", err);
  }
}

// REST Endpoints
app.get("/api/foods", (req, res) => {
  const foods = readDb();
  res.json(foods);
});

// Admin Authentication check
app.post("/api/auth", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: "admin-jwt-simulation-token" });
  } else {
    res.status(401).json({ success: false, error: "密碼不正確，請重新輸入" });
  }
});

// Create/Update Food endpoint
app.post("/api/foods", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes("admin-jwt-simulation-token")) {
    return res.status(403).json({ error: "尚未登入，拒絕寫入資料" });
  }

  const { food, actionDescription } = req.body;
  if (!food || !food.name) {
    return res.status(400).json({ error: "食物名稱不能為空" });
  }

  const foods = readDb();
  const existingIndex = foods.findIndex((f: any) => f.id === food.id || (food.barcode && f.barcode === food.barcode && f.barcode !== ""));

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  if (existingIndex > -1) {
    // Check old values to produce a friendly automatic history version
    const oldFood = foods[existingIndex];
    const changes: string[] = [];

    if (oldFood.name !== food.name) changes.push(`名稱由「${oldFood.name}」改為「${food.name}」`);
    if (oldFood.category !== food.category) changes.push(`類別改為「${food.category}」`);
    
    // Check macronutrient changes
    const nutrientsToCheck: { key: string; name: string }[] = [
      { key: "energy", name: "熱量" },
      { key: "protein", name: "蛋白質" },
      { key: "fat", name: "脂肪" },
      { key: "carbohydrate", name: "碳水化合物" },
      { key: "sugar", name: "糖" },
      { key: "sodium", name: "鈉" }
    ];
    nutrientsToCheck.forEach((item) => {
      const oldPer = oldFood.perServing[item.key];
      const newPer = food.perServing[item.key];
      if (oldPer !== newPer) {
        changes.push(`${item.name}單份標示由 ${oldPer} 變更為 ${newPer}`);
      }
    });

    const desc = actionDescription || (changes.length > 0 ? `更新了商品內容: ${changes.join("、")}` : "更新商品營養資訊");

    const newLog = {
      id: "v-" + Math.random().toString(36).substr(2, 9),
      timestamp,
      action: "update" as const,
      description: desc,
      author: "管理者"
    };

    const finalHistory = [newLog, ...(oldFood.history || [])];
    const updatedFood = {
      ...food,
      id: oldFood.id, // Preserve standard ID
      history: finalHistory
    };

    foods[existingIndex] = updatedFood;
    writeDb(foods);
    res.json({ success: true, food: updatedFood, action: "update" });
  } else {
    // Create new food item
    const newId = food.id || "food-" + Math.random().toString(36).substr(2, 9);
    const newLog = {
      id: "v-" + Math.random().toString(36).substr(2, 9),
      timestamp,
      action: "create" as const,
      description: actionDescription || "新增防拷食物數據，建立首個版本型號紀錄",
      author: "管理者"
    };

    const newFood = {
      ...food,
      id: newId,
      history: [newLog]
    };

    foods.unshift(newFood);
    writeDb(foods);
    res.json({ success: true, food: newFood, action: "create" });
  }
});

// Delete Food Endpoint
app.delete("/api/foods/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes("admin-jwt-simulation-token")) {
    return res.status(403).json({ error: "尚未登入，拒絕刪除資料" });
  }

  const { id } = req.params;
  const foods = readDb();
  const filtered = foods.filter((f: any) => f.id !== id);
  
  if (foods.length === filtered.length) {
    return res.status(404).json({ error: "找不到該筆食物主鍵" });
  }

  writeDb(filtered);
  res.json({ success: true });
});

// Gemini AI OCR Route
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "未接收到上傳的圖片數據 (Base64 is required)" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "伺服器未設定 GEMINI_API_KEY，請至 Settings > SecretsPanel 填寫之後重新測試。" 
      });
    }

    // Initialize Gemini API (as requested by instructions)
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Strip header from base64 if present, extract actual inline binary payload
    let strippedBase64 = imageBase64;
    let mimeType = "image/png";
    
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      strippedBase64 = parts[1];
      mimeType = parts[0].split(":")[1] || "image/png";
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: strippedBase64,
      },
    };

    const promptText = `
      你是專業的繁體中文營養標示 OCR 辨識助理。請詳細閱讀圖片中的「營養標示」、「食品成份」和「條碼/包裝資訊」。
      
      請將其中的數據精確填入提供的與 JSON 綱要 (Schema) 完全一致的格式中。
      注意事項：
      1. 請辨識出「商品名稱 (name)」、「品牌/製造商 (brand)」與 13 位數的「商品條碼 (barcode)」。如果找不到條碼，請回傳空字串。
      2. 分類 (category) 只能是：穀物雜糧, 肉類與蛋, 海鮮水產, 新鮮蔬菜, 當季水果, 乳製品, 飲料, 休閒零嘴, 醬料, 即食與熟食, 堅果種子, 健身補給, 高蛋白點心 之一。
      3. 填寫每份量的值 (servingValue) 與是否為液體 (isLiquid)。
      4. 提取「每份 (perServing)」與「每 100公克或100毫升 (per100g)」的數值。
         如果標示中只提供「每份」或只提供「每 100公克」，請透過 math 比例計算(基於份量值 servingValue) 自動推導及補齊另一方的數值。
         例如每份 30g 含有 3g 蛋白質，則每100g 含有 (3 / 30) * 100 = 10g 蛋白質。
      5. 微量元素(鈉、鈣、鐵、鋅、鎂、鉀、磷、膽固醇等) 只要有標示即填入。如果圖片完全找不到這些元素，可使用預設 0 的數值。
      6. 回應語言必須是繁體中文 (Traditional Chinese)。
    `;

    const textPart = {
      text: promptText,
    };

    // Constructing standard `@google/genai` JSON schema as taught in SKILL.md
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "商品名稱以繁體中文表示 (例如：無糖高纖豆漿)" },
            brand: { type: Type.STRING, description: "製造商品牌以繁體中文表示 (例如：義美、光泉、萬歲牌)" },
            barcode: { type: Type.STRING, description: "13位條碼，若無則傳空字串" },
            category: { 
              type: Type.STRING, 
              description: "推薦類別，必須為：穀物雜糧, 肉類與蛋, 海鮮水產, 新鮮蔬菜, 當季水果, 乳製品, 飲料, 休閒零嘴, 醬料, 即食與熟食, 堅果種子, 健身補給, 高蛋白點心 之一" 
            },
            servingSizeText: { type: Type.STRING, description: "份量標示純文字描述 (例如：每一份量 30 公克，本包裝含 10 份)" },
            servingValue: { type: Type.NUMBER, description: "單份的數值多大，例如 30" },
            isLiquid: { type: Type.BOOLEAN, description: "是否為液體形式 (ml/毫升)，若否為固體(g)" },
            perServing: {
              type: Type.OBJECT,
              description: "單份對應的營養成分",
              properties: {
                energy: { type: Type.NUMBER, description: "熱量 (kcal)" },
                protein: { type: Type.NUMBER, description: "蛋白質 (g)" },
                fat: { type: Type.NUMBER, description: "脂肪 (g)" },
                saturatedFat: { type: Type.NUMBER, description: "飽和脂肪 (g)" },
                transFat: { type: Type.NUMBER, description: "反式脂肪 (g)" },
                cholesterol: { type: Type.NUMBER, description: "膽固醇 (mg)" },
                carbohydrate: { type: Type.NUMBER, description: "碳水化合物 (g)" },
                sugar: { type: Type.NUMBER, description: "糖 (g)" },
                fiber: { type: Type.NUMBER, description: "膳食纖維 (g)" },
                sodium: { type: Type.NUMBER, description: "鈉 (mg)" },
                calcium: { type: Type.NUMBER, description: "鈣 (mg)" },
                potassium: { type: Type.NUMBER, description: "鉀 (mg)" },
                phosphorus: { type: Type.NUMBER, description: "磷 (mg)" },
                magnesium: { type: Type.NUMBER, description: "鎂 (mg)" },
                zinc: { type: Type.NUMBER, description: "鋅 (mg)" },
                iron: { type: Type.NUMBER, description: "鐵 (mg)" }
              }
            },
            per100g: {
              type: Type.OBJECT,
              description: "每100克或每100毫升對應的營養成份，計算補齊",
              properties: {
                energy: { type: Type.NUMBER, description: "熱量 (kcal)" },
                protein: { type: Type.NUMBER, description: "蛋白質 (g)" },
                fat: { type: Type.NUMBER, description: "脂肪 (g)" },
                saturatedFat: { type: Type.NUMBER, description: "飽和脂肪 (g)" },
                transFat: { type: Type.NUMBER, description: "反式脂肪 (g)" },
                cholesterol: { type: Type.NUMBER, description: "膽固醇 (mg)" },
                carbohydrate: { type: Type.NUMBER, description: "碳水化合物 (g)" },
                sugar: { type: Type.NUMBER, description: "糖 (g)" },
                fiber: { type: Type.NUMBER, description: "膳食纖維 (g)" },
                sodium: { type: Type.NUMBER, description: "鈉 (mg)" },
                calcium: { type: Type.NUMBER, description: "鈣 (mg)" },
                potassium: { type: Type.NUMBER, description: "鉀 (mg)" },
                phosphorus: { type: Type.NUMBER, description: "磷 (mg)" },
                magnesium: { type: Type.NUMBER, description: "鎂 (mg)" },
                zinc: { type: Type.NUMBER, description: "鋅 (mg)" },
                iron: { type: Type.NUMBER, description: "鐵 (mg)" }
              }
            }
          },
          required: ["name", "brand", "barcode", "category", "servingSizeText", "servingValue", "isLiquid", "perServing", "per100g"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Gemini AI 回傳了空白資訊。");
    }

    const parsedData = JSON.parse(textResult.trim());
    res.json(parsedData);

  } catch (err: any) {
    console.error("OCR API error in backend", err);
    res.status(500).json({ error: err?.message || "AI 辨識過程中發生未知錯誤，請重試並確認圖片清晰度" });
  }
});

// Vite & Static file handler functions
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartFood sever bound and running perfectly on port ${PORT}`);
  });
}

startServer();
