var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "20mb" }));
app.use(import_express.default.urlencoded({ limit: "20mb", extended: true }));
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "\u672A\u63A5\u6536\u5230\u4E0A\u50B3\u7684\u5716\u7247\u6578\u64DA (Base64 is required)" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "\u4F3A\u670D\u5668\u672A\u5075\u6E2C\u5230 GEMINI_API_KEY\u3002\u8ACB\u9EDE\u64CA AI Studio \u5DE6\u4E0A\u89D2\u9078\u55AE\u6216\u53F3\u5074\u7684\u300CSettings (\u8A2D\u5B9A)\u300D > \u300CSecrets (\u5BC6\u9470)\u300D\uFF0C\u65B0\u589E\u4E26\u547D\u540D\u70BA GEMINI_API_KEY \u586B\u5165\u60A8\u7684 Gemini API \u5BC6\u9470\u5373\u53EF\uFF01"
      });
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    let strippedBase64 = imageBase64;
    let mimeType = "image/png";
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      strippedBase64 = parts[1];
      mimeType = parts[0].split(":")[1] || "image/png";
    }
    const imagePart = {
      inlineData: {
        mimeType,
        data: strippedBase64
      }
    };
    const promptText = `
      \u4F60\u662F\u5C08\u696D\u7684\u7E41\u9AD4\u4E2D\u6587\u71DF\u990A\u6A19\u793A OCR \u8FA8\u8B58\u52A9\u7406\u3002\u8ACB\u8A73\u7D30\u95B1\u8B80\u5716\u7247\u4E2D\u7684\u300C\u71DF\u990A\u6A19\u793A\u300D\u3001\u300C\u98DF\u54C1\u6210\u4EFD\u300D\u548C\u300C\u689D\u78BC/\u5305\u88DD\u8CC7\u8A0A\u300D\u3002
      
      \u8ACB\u5C07\u5176\u4E2D\u7684\u6578\u64DA\u7CBE\u78BA\u586B\u5165\u63D0\u4F9B\u7684\u8207 JSON \u7DB1\u8981 (Schema) \u5B8C\u5168\u4E00\u81F4\u7684\u683C\u5F0F\u4E2D\u3002
      \u6CE8\u610F\u4E8B\u9805\uFF1A
      1. \u8ACB\u8FA8\u8B58\u51FA\u300C\u5546\u54C1\u540D\u7A31 (name)\u300D\u3001\u300C\u54C1\u724C/\u88FD\u9020\u5546 (brand)\u300D\u8207 13 \u4F4D\u6578\u7684\u300C\u5546\u54C1\u689D\u78BC (barcode)\u300D\u3002\u5982\u679C\u627E\u4E0D\u5230\u689D\u78BC\uFF0C\u8ACB\u56DE\u50B3\u7A7A\u5B57\u4E32\u3002
      2. \u5206\u985E (category) \u53EA\u80FD\u662F\uFF1A\u7A40\u7269\u96DC\u7CE7, \u8089\u985E\u8207\u86CB, \u6D77\u9BAE\u6C34\u7522, \u65B0\u9BAE\u852C\u83DC, \u7576\u5B63\u6C34\u679C, \u4E73\u88FD\u54C1, \u98F2\u6599, \u4F11\u9592\u96F6\u5634, \u91AC\u6599, \u5373\u98DF\u8207\u719F\u98DF, \u5805\u679C\u7A2E\u5B50, \u5065\u8EAB\u88DC\u7D66, \u9AD8\u86CB\u767D\u9EDE\u5FC3 \u4E4B\u4E00\u3002
      3. \u586B\u5BEB\u6BCF\u4EFD\u91CF\u7684\u503C (servingValue) \u8207\u662F\u5426\u70BA\u6DB2\u9AD4 (isLiquid)\u3002
      4. \u63D0\u53D6\u300C\u6BCF\u4EFD (perServing)\u300D\u8207\u300C\u6BCF 100\u516C\u514B\u6216100\u6BEB\u5347 (per100g)\u300D\u7684\u6578\u503C\u3002
         \u5982\u679C\u6A19\u793A\u4E2D\u53EA\u63D0\u4F9B\u300C\u6BCF\u4EFD\u300D\u6216\u53EA\u63D0\u4F9B\u300C\u6BCF 100\u516C\u514B\u300D\uFF0C\u8ACB\u900F\u904E math \u6BD4\u4F8B\u8A08\u7B97(\u57FA\u65BC\u4EFD\u91CF\u503C servingValue) \u81EA\u52D5\u63A8\u5C0E\u53CA\u88DC\u9F4A\u53E6\u4E00\u65B9\u7684\u6578\u503C\u3002
         \u4F8B\u5982\u6BCF\u4EFD 30g \u542B\u6709 3g \u86CB\u767D\u8CEA\uFF0C\u5247\u6BCF100g \u542B\u6709 (3 / 30) * 100 = 10g \u86CB\u767D\u8CEA\u3002
      5. \u5FAE\u91CF\u5143\u7D20(\u9209\u3001\u9223\u3001\u9435\u3001\u92C5\u3001\u9382\u3001\u9240\u3001\u78F7\u3001\u81BD\u56FA\u9187\u7B49) \u53EA\u8981\u6709\u6A19\u793A\u5373\u586B\u5165\u3002\u5982\u679C\u5716\u7247\u5B8C\u5168\u627E\u4E0D\u5230\u9019\u4E9B\u5143\u7D20\uFF0C\u53EF\u4F7F\u7528\u9810\u8A2D 0 \u7684\u6578\u503C\u3002
      6. \u56DE\u61C9\u8A9E\u8A00\u5FC5\u9808\u662F\u7E41\u9AD4\u4E2D\u6587 (Traditional Chinese)\u3002
    `;
    const textPart = {
      text: promptText
    };
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            name: { type: import_genai.Type.STRING, description: "\u5546\u54C1\u540D\u7A31\u4EE5\u7E41\u9AD4\u4E2D\u6587\u8868\u793A (\u4F8B\u5982\uFF1A\u7121\u7CD6\u9AD8\u7E96\u8C46\u6F3F)" },
            brand: { type: import_genai.Type.STRING, description: "\u88FD\u9020\u5546\u54C1\u724C\u4EE5\u7E41\u9AD4\u4E2D\u6587\u8868\u793A (\u4F8B\u5982\uFF1A\u7FA9\u7F8E\u3001\u5149\u6CC9\u3001\u842C\u6B72\u724C)" },
            barcode: { type: import_genai.Type.STRING, description: "13\u4F4D\u689D\u78BC\uFF0C\u82E5\u7121\u5247\u50B3\u7A7A\u5B57\u4E32" },
            category: {
              type: import_genai.Type.STRING,
              description: "\u63A8\u85A6\u985E\u5225\uFF0C\u5FC5\u9808\u70BA\uFF1A\u7A40\u7269\u96DC\u7CE7, \u8089\u985E\u8207\u86CB, \u6D77\u9BAE\u6C34\u7522, \u65B0\u9BAE\u852C\u83DC, \u7576\u5B63\u6C34\u679C, \u4E73\u88FD\u54C1, \u98F2\u6599, \u4F11\u9592\u96F6\u5634, \u91AC\u6599, \u5373\u98DF\u8207\u719F\u98DF, \u5805\u679C\u7A2E\u5B50, \u5065\u8EAB\u88DC\u7D66, \u9AD8\u86CB\u767D\u9EDE\u5FC3 \u4E4B\u4E00"
            },
            servingSizeText: { type: import_genai.Type.STRING, description: "\u4EFD\u91CF\u6A19\u793A\u7D14\u6587\u5B57\u63CF\u8FF0 (\u4F8B\u5982\uFF1A\u6BCF\u4E00\u4EFD\u91CF 30 \u516C\u514B\uFF0C\u672C\u5305\u88DD\u542B 10 \u4EFD)" },
            servingValue: { type: import_genai.Type.NUMBER, description: "\u55AE\u4EFD\u7684\u6578\u503C\u591A\u5927\uFF0C\u4F8B\u5982 30" },
            isLiquid: { type: import_genai.Type.BOOLEAN, description: "\u662F\u5426\u70BA\u6DB2\u9AD4\u5F62\u5F0F (ml/\u6BEB\u5347)\uFF0C\u82E5\u5426\u70BA\u56FA\u9AD4(g)" },
            perServing: {
              type: import_genai.Type.OBJECT,
              description: "\u55AE\u4EFD\u5C0D\u61C9\u7684\u71DF\u990A\u6210\u5206",
              properties: {
                energy: { type: import_genai.Type.NUMBER, description: "\u71B1\u91CF (kcal)" },
                protein: { type: import_genai.Type.NUMBER, description: "\u86CB\u767D\u8CEA (g)" },
                fat: { type: import_genai.Type.NUMBER, description: "\u8102\u80AA (g)" },
                saturatedFat: { type: import_genai.Type.NUMBER, description: "\u98FD\u548C\u8102\u80AA (g)" },
                transFat: { type: import_genai.Type.NUMBER, description: "\u53CD\u5F0F\u8102\u80AA (g)" },
                cholesterol: { type: import_genai.Type.NUMBER, description: "\u81BD\u56FA\u9187 (mg)" },
                carbohydrate: { type: import_genai.Type.NUMBER, description: "\u78B3\u6C34\u5316\u5408\u7269 (g)" },
                sugar: { type: import_genai.Type.NUMBER, description: "\u7CD6 (g)" },
                fiber: { type: import_genai.Type.NUMBER, description: "\u81B3\u98DF\u7E96\u7DAD (g)" },
                sodium: { type: import_genai.Type.NUMBER, description: "\u9209 (mg)" },
                calcium: { type: import_genai.Type.NUMBER, description: "\u9223 (mg)" },
                potassium: { type: import_genai.Type.NUMBER, description: "\u9240 (mg)" },
                phosphorus: { type: import_genai.Type.NUMBER, description: "\u78F7 (mg)" },
                magnesium: { type: import_genai.Type.NUMBER, description: "\u9382 (mg)" },
                zinc: { type: import_genai.Type.NUMBER, description: "\u92C5 (mg)" },
                iron: { type: import_genai.Type.NUMBER, description: "\u9435 (mg)" }
              }
            },
            per100g: {
              type: import_genai.Type.OBJECT,
              description: "\u6BCF100\u514B\u6216\u6BCF100\u6BEB\u5347\u5C0D\u61C9\u7684\u71DF\u990A\u6210\u4EFD\uFF0C\u8A08\u7B97\u88DC\u9F4A",
              properties: {
                energy: { type: import_genai.Type.NUMBER, description: "\u71B1\u91CF (kcal)" },
                protein: { type: import_genai.Type.NUMBER, description: "\u86CB\u767D\u8CEA (g)" },
                fat: { type: import_genai.Type.NUMBER, description: "\u8102\u80AA (g)" },
                saturatedFat: { type: import_genai.Type.NUMBER, description: "\u98FD\u548C\u8102\u80AA (g)" },
                transFat: { type: import_genai.Type.NUMBER, description: "\u53CD\u5F0F\u8102\u80AA (g)" },
                cholesterol: { type: import_genai.Type.NUMBER, description: "\u81BD\u56FA\u9187 (mg)" },
                carbohydrate: { type: import_genai.Type.NUMBER, description: "\u78B3\u6C34\u5316\u5408\u7269 (g)" },
                sugar: { type: import_genai.Type.NUMBER, description: "\u7CD6 (g)" },
                fiber: { type: import_genai.Type.NUMBER, description: "\u81B3\u98DF\u7E96\u7DAD (g)" },
                sodium: { type: import_genai.Type.NUMBER, description: "\u9209 (mg)" },
                calcium: { type: import_genai.Type.NUMBER, description: "\u9223 (mg)" },
                potassium: { type: import_genai.Type.NUMBER, description: "\u9240 (mg)" },
                phosphorus: { type: import_genai.Type.NUMBER, description: "\u78F7 (mg)" },
                magnesium: { type: import_genai.Type.NUMBER, description: "\u9382 (mg)" },
                zinc: { type: import_genai.Type.NUMBER, description: "\u92C5 (mg)" },
                iron: { type: import_genai.Type.NUMBER, description: "\u9435 (mg)" }
              }
            }
          },
          required: ["name", "brand", "barcode", "category", "servingSizeText", "servingValue", "isLiquid", "perServing", "per100g"]
        }
      }
    });
    const textResult = response.text;
    if (!textResult) {
      throw new Error("Gemini AI \u56DE\u50B3\u4E86\u7A7A\u767D\u8CC7\u8A0A\u3002");
    }
    let cleanedText = textResult.trim();
    if (cleanedText.startsWith("```")) {
      const match = cleanedText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      if (match) {
        cleanedText = match[1];
      }
    }
    const parsedData = JSON.parse(cleanedText.trim());
    res.json(parsedData);
  } catch (err) {
    console.error("OCR API error in backend", err);
    res.status(500).json({ error: err?.message || "AI \u8FA8\u8B58\u904E\u7A0B\u4E2D\u767C\u751F\u672A\u77E5\u932F\u8AA4\uFF0C\u8ACB\u91CD\u8A66\u4E26\u78BA\u8A8D\u5716\u7247\u6E05\u6670\u5EA6" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartFood sever bound and running perfectly on port ${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
