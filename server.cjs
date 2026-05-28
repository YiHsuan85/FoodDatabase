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
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "20mb" }));
app.use(import_express.default.urlencoded({ limit: "20mb", extended: true }));
var dbPath = import_path.default.join(process.cwd(), "foods-db.json");
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
var initialFoods = [
  {
    id: "viva-nuts-01",
    name: "\u7121\u8ABF\u5473\u7D9C\u5408\u679C",
    brand: "\u842C\u6B72\u724C",
    barcode: "4710022026362",
    category: "\u5805\u679C\u7A2E\u5B50",
    image: "",
    // Use CSS layout or category fallback if empty
    servingSizeText: "\u672C\u5305\u88DD\u542B28\u4EFD\uFF0C\u6BCF\u4EFD28\u516C\u514B",
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u53F0\u7063\u842C\u6B72\u724C\u7121\u8ABF\u5473\u7D9C\u5408\u679C\u71DF\u990A\u6578\u64DA\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "imei-milk-01",
    name: "\u4F4E\u8102\u9BAE\u4E73",
    brand: "\u7FA9\u7F8E",
    barcode: "4712439121088",
    category: "\u4E73\u88FD\u54C1",
    image: "",
    servingSizeText: "\u672C\u5305\u88DD\u542B1\u4EFD\uFF0C\u6BCF\u4EFD290\u6BEB\u5347",
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
      saturatedFat: 1,
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u7FA9\u7F8E\u4F4E\u8102\u9BAE\u4E73\u6578\u64DA\uFF0C\u9AD8\u9223\u9AD8\u86CB\u767D\u8CEA\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "soy-milk-01",
    name: "\u9AD8\u7E96\u7121\u7CD6\u8C46\u6F3F",
    brand: "\u7D71\u4E00\u5143\u6C23\u7A2E\u5B50",
    barcode: "4710088432138",
    category: "\u98F2\u6599",
    image: "",
    servingSizeText: "\u6BCF\u4E00\u4EFD\u91CF400\u6BEB\u5347\uFF0C\u672C\u5305\u88DD\u542B1\u4EFD",
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
      iron: 2
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u9AD8\u7E96\u7121\u7CD6\u8C46\u6F3F\uFF0C\u9AD8\u86CB\u767D\u3001\u4F4E\u9209\u3001\u9AD8\u7E96\u71DF\u990A\u6578\u64DA\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "chicken-01",
    name: "\u5373\u98DF\u96DE\u80F8\u8089-\u539F\u5473",
    brand: "\u535C\u8702",
    barcode: "4710254005119",
    category: "\u8089\u985E\u8207\u86CB",
    image: "",
    servingSizeText: "\u6BCF\u4E00\u4EFD\u91CF100\u516C\u514B\uFF0C\u672C\u5305\u88DD\u542B1\u4EFD",
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u535C\u8702\u5373\u98DF\u96DE\u80F8\u8089\u71DF\u990A\u6578\u64DA\uFF0C\u8D85\u9AD8\u86CB\u767D\u4EE3\u8868\u98DF\u54C1\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "quaker-oats-01",
    name: "\u5373\u98DF\u71D5\u9EA5\u7247",
    brand: "\u6842\u683C",
    barcode: "4710043024506",
    category: "\u7A40\u7269\u96DC\u7CE7",
    image: "",
    servingSizeText: "\u6BCF\u4E00\u4EFD\u91CF37.5\u516C\u514B\uFF0C\u672C\u5305\u88DD\u542B21\u4EFD",
    servingValue: 37.5,
    isLiquid: false,
    perServing: {
      energy: 140,
      protein: 5,
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
      carbohydrate: 67,
      sugar: 1.1,
      fiber: 9.9,
      sodium: 2,
      calcium: 48,
      potassium: 350,
      phosphorus: 411,
      magnesium: 117,
      zinc: 2.9,
      iron: 4
    },
    history: [
      {
        id: "h5",
        timestamp: "2026-05-28 14:12:00",
        action: "system_init",
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u6842\u683C\u5373\u98DF\u71D5\u9EA5\u7247\u6578\u64DA\uFF0C\u517C\u542B\u9AD8\u7E96\u7DAD\u8207\u7926\u7269\u8CEA\u92C5\u3001\u9435\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "taiwan-banana-01",
    name: "\u53F0\u7063\u7576\u5B63\u9999\u8549",
    brand: "\u7DA0\u4E4B\u5712\u8FB2\u7522",
    barcode: "4712345670891",
    category: "\u7576\u5B63\u6C34\u679C",
    image: "",
    servingSizeText: "\u6BCF\u4E00\u4EFD\u91CF120\u516C\u514B\uFF0C\u672C\u5305\u88DD\u542B1\u4EFD",
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
      carbohydrate: 22,
      sugar: 12,
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u53F0\u7063\u672C\u571F\u7576\u5B63\u9999\u8549\u6578\u64DA\uFF0C\u5BCC\u542B\u5FAE\u91CF\u5143\u7D20\u9240\u3001\u9382\u8207\u81B3\u98DF\u7E96\u7DAD\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "tomato-mackerel-01",
    name: "\u756A\u8304\u6C41\u9BD6\u9B5A\u7F50\u982D",
    brand: "\u540C\u69AE",
    barcode: "4710185011037",
    category: "\u5373\u98DF\u8207\u719F\u98DF",
    image: "",
    servingSizeText: "\u6BCF\u4E00\u4EFD\u91CF150\u516C\u514B\uFF0C\u672C\u5305\u88DD\u542B1\u4EFD",
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u540C\u69AE\u756A\u8304\u9BD6\u9B5A\u7D05\u7F50\uFF0C\u8C50\u5BCC\u9223\u8CEA\u8207\u9435\u8CEA\uFF0C\u5373\u98DF\u597D\u9078\u64C7\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  },
  {
    id: "sunflower-oil-01",
    name: "\u4E0D\u98FD\u548C\u8475\u82B1\u6CB9",
    brand: "\u6CF0\u5C71",
    barcode: "4710252110297",
    category: "\u91AC\u6599",
    image: "",
    servingSizeText: "\u6BCF\u4E00\u4EFD\u91CF10\u6BEB\u5347\uFF0C\u672C\u5305\u88DD\u542B200\u4EFD",
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
      transFat: 1,
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
        description: "\u7CFB\u7D71\u9810\u8A2D\u8F09\u5165\u6CF0\u5C71\u8475\u82B1\u7C7D\u6CB9\u7D14\u6CB9\u8102\u7D14\u5EA6\u5206\u6790\u6578\u64DA\u3002",
        author: "\u7CFB\u7D71\u521D\u59CB\u5316"
      }
    ]
  }
];
function readDb() {
  try {
    if (import_fs.default.existsSync(dbPath)) {
      const content = import_fs.default.readFileSync(dbPath, "utf-8");
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
function writeDb(data) {
  try {
    import_fs.default.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Database write error", err);
  }
}
app.get("/api/foods", (req, res) => {
  const foods = readDb();
  res.json(foods);
});
app.post("/api/auth", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: "admin-jwt-simulation-token" });
  } else {
    res.status(401).json({ success: false, error: "\u5BC6\u78BC\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u91CD\u65B0\u8F38\u5165" });
  }
});
app.post("/api/foods", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes("admin-jwt-simulation-token")) {
    return res.status(403).json({ error: "\u5C1A\u672A\u767B\u5165\uFF0C\u62D2\u7D55\u5BEB\u5165\u8CC7\u6599" });
  }
  const { food, actionDescription } = req.body;
  if (!food || !food.name) {
    return res.status(400).json({ error: "\u98DF\u7269\u540D\u7A31\u4E0D\u80FD\u70BA\u7A7A" });
  }
  const foods = readDb();
  const existingIndex = foods.findIndex((f) => f.id === food.id || food.barcode && f.barcode === food.barcode && f.barcode !== "");
  const now = /* @__PURE__ */ new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  if (existingIndex > -1) {
    const oldFood = foods[existingIndex];
    const changes = [];
    if (oldFood.name !== food.name) changes.push(`\u540D\u7A31\u7531\u300C${oldFood.name}\u300D\u6539\u70BA\u300C${food.name}\u300D`);
    if (oldFood.category !== food.category) changes.push(`\u985E\u5225\u6539\u70BA\u300C${food.category}\u300D`);
    const nutrientsToCheck = [
      { key: "energy", name: "\u71B1\u91CF" },
      { key: "protein", name: "\u86CB\u767D\u8CEA" },
      { key: "fat", name: "\u8102\u80AA" },
      { key: "carbohydrate", name: "\u78B3\u6C34\u5316\u5408\u7269" },
      { key: "sugar", name: "\u7CD6" },
      { key: "sodium", name: "\u9209" }
    ];
    nutrientsToCheck.forEach((item) => {
      const oldPer = oldFood.perServing[item.key];
      const newPer = food.perServing[item.key];
      if (oldPer !== newPer) {
        changes.push(`${item.name}\u55AE\u4EFD\u6A19\u793A\u7531 ${oldPer} \u8B8A\u66F4\u70BA ${newPer}`);
      }
    });
    const desc = actionDescription || (changes.length > 0 ? `\u66F4\u65B0\u4E86\u5546\u54C1\u5167\u5BB9: ${changes.join("\u3001")}` : "\u66F4\u65B0\u5546\u54C1\u71DF\u990A\u8CC7\u8A0A");
    const newLog = {
      id: "v-" + Math.random().toString(36).substr(2, 9),
      timestamp,
      action: "update",
      description: desc,
      author: "\u7BA1\u7406\u8005"
    };
    const finalHistory = [newLog, ...oldFood.history || []];
    const updatedFood = {
      ...food,
      id: oldFood.id,
      // Preserve standard ID
      history: finalHistory
    };
    foods[existingIndex] = updatedFood;
    writeDb(foods);
    res.json({ success: true, food: updatedFood, action: "update" });
  } else {
    const newId = food.id || "food-" + Math.random().toString(36).substr(2, 9);
    const newLog = {
      id: "v-" + Math.random().toString(36).substr(2, 9),
      timestamp,
      action: "create",
      description: actionDescription || "\u65B0\u589E\u9632\u62F7\u98DF\u7269\u6578\u64DA\uFF0C\u5EFA\u7ACB\u9996\u500B\u7248\u672C\u578B\u865F\u7D00\u9304",
      author: "\u7BA1\u7406\u8005"
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
app.delete("/api/foods/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes("admin-jwt-simulation-token")) {
    return res.status(403).json({ error: "\u5C1A\u672A\u767B\u5165\uFF0C\u62D2\u7D55\u522A\u9664\u8CC7\u6599" });
  }
  const { id } = req.params;
  const foods = readDb();
  const filtered = foods.filter((f) => f.id !== id);
  if (foods.length === filtered.length) {
    return res.status(404).json({ error: "\u627E\u4E0D\u5230\u8A72\u7B46\u98DF\u7269\u4E3B\u9375" });
  }
  writeDb(filtered);
  res.json({ success: true });
});
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "\u672A\u63A5\u6536\u5230\u4E0A\u50B3\u7684\u5716\u7247\u6578\u64DA (Base64 is required)" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "\u4F3A\u670D\u5668\u672A\u8A2D\u5B9A GEMINI_API_KEY\uFF0C\u8ACB\u81F3 Settings > SecretsPanel \u586B\u5BEB\u4E4B\u5F8C\u91CD\u65B0\u6E2C\u8A66\u3002"
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
    const parsedData = JSON.parse(textResult.trim());
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
