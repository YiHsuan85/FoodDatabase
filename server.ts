/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
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

// The foods DB and Auth are now handled by Firebase client directly on the frontend.
// The AI request proxy must remain here.
// OCR Route below:

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
