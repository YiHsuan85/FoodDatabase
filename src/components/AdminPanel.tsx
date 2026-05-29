/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FoodItem, 
  FOOD_CATEGORIES, 
  NUTRITION_LABELS, 
  NutritionValues, 
  FoodCategory 
} from "../types";
import { 
  Lock, 
  Unlock, 
  Plus, 
  Sparkles, 
  Camera, 
  FileLock, 
  Loader2, 
  ChevronRight, 
  Save, 
  X,
  History,
  CheckCircle,
  HelpCircle,
  Calculator,
  Database
} from "lucide-react";
import { ThemeColors, THEME_PRESETS } from "../themes";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth";
import { INITIAL_FOODS } from "../initialFoods";


interface AdminPanelProps {
  foods: FoodItem[];
  onSaveFood: (food: Omit<FoodItem, "history">, actionDescription?: string) => Promise<boolean>;
  onDeleteFood: (id: string) => Promise<boolean>;
  theme?: ThemeColors;
}

const emptyNutrientValues = (): NutritionValues => ({
  energy: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  transFat: 0,
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
});

export default function AdminPanel({ foods, onSaveFood, onDeleteFood, theme }: AdminPanelProps) {
  const currentTheme = theme || THEME_PRESETS[0];
  const focusRingClass = currentTheme.id === "emerald" 
    ? "focus:ring-[#10B981]" 
    : `focus:ring-${currentTheme.id === "sapphire" ? "blue" : currentTheme.id === "purple" ? "purple" : currentTheme.id === "amber" ? "amber" : "red"}-500`;

  const hoverBgClass = currentTheme.id === "emerald" 
    ? "hover:bg-[#059669]" 
    : `hover:bg-${currentTheme.id === "sapphire" ? "blue" : currentTheme.id === "purple" ? "violet" : currentTheme.id === "amber" ? "orange" : "red"}-650`;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setIsInitializing(false);
    });
    return () => unsub();
  }, []);

  // Tabs: 'list' | 'add' | 'logs'
  const [activeTab, setActiveTab] = useState<"list" | "add" | "logs">("list");
  
  // OCR AI Scanning loading states
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string>("");
  const [ocrSuccess, setOcrSuccess] = useState<boolean>(false);

  // Seeding state variables
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);
  const [seedError, setSeedError] = useState<string>("");

  // Editing Food State
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [category, setCategory] = useState<string>("穀物雜糧");
  const [servingSizeText, setServingSizeText] = useState<string>("每一份量30公克，本包裝含1份");
  const [servingValue, setServingValue] = useState<number>(30);
  const [isLiquid, setIsLiquid] = useState<boolean>(false);
  const [perServingForm, setPerServingForm] = useState<NutritionValues>(emptyNutrientValues());
  const [per100gForm, setPer100gForm] = useState<NutritionValues>(emptyNutrientValues());
  const [actionDescription, setActionDescription] = useState<string>("");

  // List Filter State
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");
  const [adminSelectedCategory, setAdminSelectedCategory] = useState<string>("all");

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = adminSearchQuery.trim() === "" ||
      food.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
      (food.barcode && food.barcode.toLowerCase().includes(adminSearchQuery.toLowerCase()));
    
    const matchesCategory = adminSelectedCategory === "all" || food.category === adminSelectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handling Authentication submit
  const handleAuthSubmit = async () => {
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setAuthError(err.message || "登入過程中發生錯誤");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Convert files as Base64 for OCR scan
  const handleOcrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError("");
    setOcrSuccess(false);
    setIsOcrLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch("/api/gemini/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64String })
        });
        const data = await response.json();

        if (response.ok && data.name) {
          // Pre-fill fields with scanned results!
          setName(data.name || "");
          setBrand(data.brand || "");
          setBarcode(data.barcode || "");
          if (data.category) setCategory(data.category);
          setServingSizeText(data.servingSizeText || "");
          setServingValue(data.servingValue || 100);
          setIsLiquid(!!data.isLiquid);
          
          if (data.perServing) setPerServingForm({ ...emptyNutrientValues(), ...data.perServing });
          if (data.per100g) setPer100gForm({ ...emptyNutrientValues(), ...data.per100g });
          
          setOcrSuccess(true);
          setActionDescription("經由 Gemini AI 圖片智慧 OCR 自動提取及補足數值");
        } else {
          setOcrError(data.error || "AI 無法在圖片中解析出合規的營養標示，請上傳更清晰的圖片。");
        }
      } catch (err) {
        setOcrError("呼叫 AI 辨識時發生伺服器連線中斷。");
      } finally {
        setIsOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input target
    e.target.value = "";
  };

  // Reset Add Form
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setBrand("");
    setBarcode("");
    setCategory("穀物雜糧");
    setServingSizeText("每一份量30公克，本包裝含1份");
    setServingValue(30);
    setIsLiquid(false);
    setPerServingForm(emptyNutrientValues());
    setPer100gForm(emptyNutrientValues());
    setActionDescription("");
    setOcrSuccess(false);
    setOcrError("");
  };

  // Switch to Edit Mode prefill
  const startEdit = (food: FoodItem) => {
    setEditingId(food.id);
    setName(food.name);
    setBrand(food.brand);
    setBarcode(food.barcode);
    setCategory(food.category);
    setServingSizeText(food.servingSizeText);
    setServingValue(food.servingValue);
    setIsLiquid(food.isLiquid);
    setPerServingForm({ ...food.perServing });
    setPer100gForm({ ...food.per100g });
    setActionDescription("");
    setActiveTab("add");
  };

  // Auto-calculated logic (Proportion scaling helper)
  const syncNutrients = (direction: "perServingTo100" | "per100ToServing") => {
    if (!servingValue || servingValue <= 0) {
      alert("請先輸入合規的單份份量數值（必須大於0），才能進行跨維度精確比例換算！");
      return;
    }

    if (direction === "perServingTo100") {
      const updated: any = {};
      const ratio = 100 / servingValue;
      (Object.keys(perServingForm) as Array<keyof NutritionValues>).forEach((key) => {
        const val = perServingForm[key];
        updated[key] = Number((val * ratio).toFixed(2));
      });
      setPer100gForm(updated as NutritionValues);
    } else {
      const updated: any = {};
      const ratio = servingValue / 100;
      (Object.keys(per100gForm) as Array<keyof NutritionValues>).forEach((key) => {
        const val = per100gForm[key];
        updated[key] = Number((val * ratio).toFixed(2));
      });
      setPerServingForm(updated as NutritionValues);
    }
  };

  // Form Submit Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("請至少輸入食物名稱！");
      return;
    }

    const payload: Omit<FoodItem, "history"> = {
      id: editingId || "food-" + Math.random().toString(36).substr(2, 9),
      name,
      brand,
      barcode,
      category,
      servingSizeText,
      servingValue: Number(servingValue),
      isLiquid,
      perServing: perServingForm,
      per100g: per100gForm
    };

    const success = await onSaveFood(payload, actionDescription);
    if (success) {
      resetForm();
      setActiveTab("list");
    }
  };

  // Delete Action
  const handleDeleteClick = async (id: string, name: string) => {
    if (confirm(`確定要永久刪除「${name}」這筆食物所有版本數據嗎？此操作不可還原。`)) {
      await onDeleteFood(id);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm text-[#1F2937]">
        <Loader2 className={`w-10 h-10 animate-spin ${currentTheme.text}`} />
        <p className="text-xs text-[#4B5563] mt-2 font-medium">正在檢查登入授權狀態，請稍後...</p>
      </div>
    );
  }

  // If NOT AUTHENTICATED -> Render Login Screen
  if (!isAuthenticated) {
    const btnHover = currentTheme.id === 'emerald' ? 'hover:bg-[#059669]' : `hover:bg-${currentTheme.id === 'sapphire' ? 'blue' : currentTheme.id === 'purple' ? 'violet font-extrabold shadow-sm' : currentTheme.id === 'amber' ? 'orange' : 'red'}-600`;

    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-[#E5E7EB] shadow-md p-8 text-[#1F2937]">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 ${currentTheme.bgLight} ${currentTheme.text} rounded-2xl mb-4`}>
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">登入雲端管理後台</h2>
          <p className="text-xs text-[#4B5563] mt-1 max-w-xs leading-relaxed">
            為維護食物原料數據庫的標竿精確度，寫入、更新及 AI OCR 掃描操作限授權管理者登入。
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {authError && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl font-semibold border border-rose-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              {authError}
            </div>
          )}

          <button
            onClick={handleAuthSubmit}
            className={`w-full py-3.5 bg-white border border-[#E5E7EB] hover:bg-neutral-50 text-neutral-800 font-bold text-sm rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-3`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            使用 Google 帳號授權登入
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center gap-1.5 bg-[#F9FAFB] p-3 rounded-xl border border-dashed border-[#E5E7EB] text-[#4B5563] text-[11px] leading-relaxed">
          <FileLock className={`w-4 h-4 ${currentTheme.text} flex-shrink-0`} />
          <span>管理員登入採用最高安全規格 Firebase Authentication 服務，保障您的連線。</span>
        </div>
      </div>
    );
  }

  // Compile all system-wide version histories to show in Logs Tab
  const allLogs = foods
    .flatMap((f) => f.history.map((h) => ({ ...h, foodName: f.name, foodId: f.id })))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden min-h-[500px] text-[#1F2937]">
      
      {/* Top bar */}
      <div className="bg-[#F9FAFB] text-neutral-900 p-5 px-6 flex flex-wrap justify-between items-center gap-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${currentTheme.bgLight} ${currentTheme.text} rounded-xl border ${currentTheme.borderLight}`}>
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">食物資料庫 • 管理維護中心</h2>
            <p className="text-xs text-[#4B5563]">目前身分：系統管理者 (帳號：{currentUser?.email || "Admin"})</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 text-xs font-bold bg-[#F3F4F6] hover:bg-rose-50 hover:text-rose-600 text-[#4B5563] rounded-lg cursor-pointer transition-all border border-[#E5E7EB]"
        >
          登出管理權限
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB] p-2.5 gap-2">
        <button
          onClick={() => { setActiveTab("list"); resetForm(); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeTab === "list" 
              ? `${currentTheme.bg} text-white shadow-sm` 
              : "text-[#4B5563] hover:bg-[#E5E7EB]"
          }`}
        >
          食物資料庫清單 管理 ({foods.length})
        </button>
        <button
          onClick={() => { resetForm(); setActiveTab("add"); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === "add" 
              ? `${currentTheme.bg} text-white shadow-sm` 
              : "text-[#4B5563] hover:bg-[#E5E7EB]"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {editingId ? "編輯指定食物數據" : "快速新增商品資料"}
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === "logs" 
              ? `${currentTheme.bg} text-white shadow-sm` 
              : "text-[#4B5563] hover:bg-[#E5E7EB]"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          全資料庫變更版本紀錄 ({allLogs.length})
        </button>
      </div>

      {/* Tab body CONTENT */}
      <div className="p-6">
        
        {/* TAB 1: List with Edit/Delete */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3 mb-2">
              <span className="font-extrabold text-sm text-[#111827]">資料庫現存食品總覽</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={isSeeding}
                  onClick={async () => {
                    if (confirm("這將會把您在 initialFoods.ts 修改的最新標竿資料，「重新同步並覆蓋寫入」或新加入到您當前的雲端 Firebase 資料庫中。確認執行？")) {
                      setIsSeeding(true);
                      setSeedError("");
                      setSeedSuccess(false);
                      try {
                        let successCount = 0;
                        for (const item of INITIAL_FOODS) {
                          const res = await onSaveFood(item, "手動觸發雲端重新同步：覆蓋/補足最新修訂之食品規格數據");
                          if (res) successCount++;
                        }
                        setSeedSuccess(true);
                        alert(`同步成功！已成功同步 ${successCount} 筆標竿食品數據到 Firebase 雲端。`);
                      } catch (err: any) {
                        setSeedError(err.message || "同步時發生非預期錯誤");
                        alert("同步失敗：" + (err.message || "未知錯誤"));
                      } finally {
                        setIsSeeding(false);
                      }
                    }
                  }}
                  className="py-1.5 px-3 bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-neutral-50 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-500" />}
                  重新同步預置資料 ({INITIAL_FOODS.length})
                </button>
                <button
                  onClick={() => setActiveTab("add")}
                  className={`py-1.5 px-3 ${currentTheme.bg} hover:brightness-110 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-all`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增食品
                </button>
              </div>
            </div>

            {foods.length === 0 ? (
              <div className="py-16 md:py-24 border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <Database className={`w-12 h-12 ${currentTheme.text} mb-4 opacity-80`} />
                <h3 className="font-extrabold text-[#111827] text-md">雲端資料庫目前為空</h3>
                <p className="text-xs text-[#4B5563] mt-1.5 max-w-sm leading-relaxed">
                  您已成功連線至自定義的 Firebase 專案 <strong>smart-food-database</strong>！您可以一鍵為此新專案資料庫批量建立預設的 <strong>30 大台灣常用食品、乳品與保健品原料標竿數據</strong>。
                </p>
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={async () => {
                      setIsSeeding(true);
                      setSeedError("");
                      setSeedSuccess(false);
                      try {
                        let successCount = 0;
                        for (const item of INITIAL_FOODS) {
                          const res = await onSaveFood(item, "初始資料庫建立：匯入預設台灣 30 大標竿食品、鮮乳與保健品原料數據");
                          if (res) successCount++;
                        }
                        setSeedSuccess(true);
                      } catch (err: any) {
                        setSeedError(err.message || "匯入時發生非預期錯誤");
                      } finally {
                        setIsSeeding(false);
                      }
                    }}
                    disabled={isSeeding}
                    className={`py-3 px-6 ${currentTheme.bg} hover:brightness-110 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-all shadow-sm ${isSeeding ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isSeeding ? "正在批次寫入數據..." : "一鍵匯入預設 30 大標竿與乳品數據"}
                  </button>
                  <button
                    onClick={() => setActiveTab("add")}
                    className="py-3 px-6 bg-white border border-[#E5E7EB] hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    手動新增首筆商品
                  </button>
                </div>
                {seedSuccess && (
                  <p className="text-xs text-emerald-600 font-bold mt-4 flex items-center gap-1.5 justify-center">
                    <CheckCircle className="w-4 h-4" />
                    資料庫初始數據 30 大食品已經成功批量寫入！
                  </p>
                )}
                {seedError && (
                  <p className="text-xs text-rose-500 font-bold mt-4">
                    匯入失敗：{seedError} (請確保您的 Firestore 資料庫與規則已正確部署，或查看 Console 報錯)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* 篩選與過濾工具列 */}
                <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                      關鍵字搜尋 (食品名稱、品牌、條碼)
                    </label>
                    <input
                      type="text"
                      placeholder="輸入關鍵字..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className={`w-full px-3 py-1.5 border border-[#E5E7EB] bg-white text-[#111827] placeholder-zinc-400 rounded-lg text-xs focus:outline-none focus:ring-2 ${focusRingClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                      按分類篩選
                    </label>
                    <select
                      value={adminSelectedCategory}
                      onChange={(e) => setAdminSelectedCategory(e.target.value)}
                      className={`w-full px-3 py-1.5 border border-[#E5E7EB] bg-white text-[#111827] rounded-lg text-xs focus:outline-none focus:ring-2 ${focusRingClass}`}
                    >
                      <option value="all">全部類別 ({foods.length})</option>
                      {FOOD_CATEGORIES.map((cat) => {
                        const count = foods.filter(f => f.category === cat).length;
                        return (
                          <option key={cat} value={cat}>
                            {cat} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSearchQuery("");
                        setAdminSelectedCategory("all");
                      }}
                      className="w-full py-1.5 border border-[#E5E7EB] hover:bg-neutral-50 text-[#4B5563] font-bold text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      清除篩選條件
                    </button>
                  </div>
                </div>

                {filteredFoods.length === 0 ? (
                  <div className="py-16 border border-dashed border-[#E5E7EB] bg-[#F9FAFB] rounded-xl text-center">
                    <Database className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-65" />
                    <p className="text-xs text-[#4B5563] font-medium">沒有符合目前篩選條件的食物數據。</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSearchQuery("");
                        setAdminSelectedCategory("all");
                      }}
                      className="mt-3 text-[11px] text-indigo-600 hover:underline font-bold"
                    >
                      重設篩選條件
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFoods.map((food) => (
                      <div 
                        key={food.id}
                        className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] flex items-center justify-between gap-4"
                      >
                        <div>
                          <span className={`text-[10px] font-bold ${currentTheme.bgLight} border ${currentTheme.borderLight} ${currentTheme.text} px-2 py-0.5 rounded-full`}>
                            {food.category}
                          </span>
                          <h4 className="font-extrabold text-[#111827] mt-1.5">
                            {food.brand ? `[${food.brand}] ` : ""}{food.name}
                          </h4>
                          <p className="text-xs text-[#4B5563] font-mono mt-0.5">
                            條碼：{food.barcode || "未登載"} | 份量：{food.servingValue}{food.isLiquid ? "毫升" : "公克"}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(food)}
                            className="p-1.5 px-3 text-xs bg-white border border-[#E5E7EB] font-bold rounded-lg cursor-pointer transition-all text-[#4B5563] hover:text-[#111827]"
                            style={{ color: '#4b5563', borderColor: '#E5E7EB' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = currentTheme.primary;
                              e.currentTarget.style.borderColor = currentTheme.primary;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#4b5563';
                              e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(food.id, food.name)}
                            className="p-1.5 px-3 text-xs bg-rose-50 border border-rose-200 font-bold rounded-lg hover:bg-rose-100 cursor-pointer text-rose-600 transition-colors"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Add / Edit Form */}
        {activeTab === "add" && (
          <div className="space-y-6">
            
            {/* AI OCR Scanner section (Only available when not editing or as addition) */}
            {!editingId && (
              <div className={`bg-gradient-to-br ${currentTheme.gradientFrom} ${currentTheme.gradientTo} text-white rounded-2xl p-5 shadow-lg border ${currentTheme.borderLight}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                      <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-md flex items-center gap-1.5">
                        AI 智慧營養標示 OCR 照相辨識
                        <span className="px-2 py-0.5 bg-yellow-400 text-neutral-900 rounded-full text-[9px] font-black tracking-wider uppercase">強力推薦</span>
                      </h3>
                      <p className="text-xs text-neutral-100 max-w-xl mt-1 leading-relaxed opacity-90">
                        省去繁瑣痛苦的手工打字工作！直接拍照或上傳食品背面的「營養標示表紙盒」或「商品條碼」，Gemini 3.5 AI 將智能辨析核心熱量與所有微量元素，並自動計算補足每份/百克的比例關係，實現快速一鍵套填。
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="ai-ocr-input"
                      onChange={handleOcrImageUpload}
                      className="hidden"
                      disabled={isOcrLoading}
                    />
                    <label
                      htmlFor="ai-ocr-input"
                      className="inline-flex items-center gap-1.5 p-3 px-5 bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold rounded-xl text-xs cursor-pointer shadow-md transition-all uppercase tracking-wide border border-transparent disabled:opacity-50"
                    >
                      {isOcrLoading ? (
                        <>
                          <Loader2 className={`w-4 h-4 animate-spin ${currentTheme.text}`} />
                          <span>正在讀取並由 AI 分析數據...</span>
                        </>
                      ) : (
                        <>
                          <Camera className={`w-4 h-4 ${currentTheme.text}`} />
                          <span>上親自相片分析 3.5 AI OCR</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {ocrError && (
                  <div className="mt-3 p-3 bg-rose-950/30 border border-rose-900/40 text-rose-450 text-xs rounded-xl font-bold">
                    {ocrError}
                  </div>
                )}

                {ocrSuccess && (
                  <div className={`mt-4 p-3 ${currentTheme.bgLight} border ${currentTheme.borderLight} ${currentTheme.text} text-xs rounded-xl font-bold flex items-center gap-2`}>
                    <CheckCircle className={`w-5 h-5 ${currentTheme.text}`} />
                    <span>恭喜！Gemini 3.5 智慧辨識食品營養成功。熱量、大宗巨量微量比例數據已成功注入下方的錄入表單中，請稍作核對微調即可發佈！</span>
                  </div>
                )}
              </div>
            )}

            {/* Standard Edit/Add Form Sheet */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5 mb-4">
                <span className="font-extrabold text-sm text-[#111827]">
                  {editingId ? "✍️ 正在編輯此食品原始數值規格" : "➕ 填寫新增食物資訊"}
                </span>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-1 px-2.5 text-[11px] font-bold bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] rounded-md cursor-pointer flex items-center gap-1 border border-[#E5E7EB]"
                  >
                    <X className="w-3.5 h-3.5" /> 關閉取消
                  </button>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1.5">
                    食物名稱 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：高纖無糖豆漿、低脂乳"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-zinc-400 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 ${focusRingClass}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1.5">
                    品牌 (製造商)
                  </label>
                  <input
                    type="text"
                    placeholder="例如：統一、義美、萬歲牌"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-zinc-400 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 ${focusRingClass}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1.5">
                    13 位商品條碼 EAN Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="例如：4710126521366"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-zinc-400 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 ${focusRingClass}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1.5">
                    選擇食物類別
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] rounded-lg text-xs focus:outline-none focus:ring-2 ${focusRingClass}`}
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white text-[#111827]">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1.5 flex items-center gap-1">
                    每一份量包裝數值描述 *
                    <HelpCircle className="w-3.5 h-3.5 text-[#4B5563]" title="這會做為前台包裝基礎份量純文字顯示" />
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="本包裝含1份，每份100公克"
                    value={servingSizeText}
                    onChange={(e) => setServingSizeText(e.target.value)}
                    className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-zinc-400 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 ${focusRingClass}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#4B5563] mb-1.5">
                      單份基準重/容量*
                    </label>
                    <input
                      type="number"
                      required
                      min={0.1}
                      step="any"
                      placeholder="30"
                      value={servingValue}
                      onChange={(e) => setServingValue(Number(e.target.value) || 0)}
                      className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-zinc-400 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 ${focusRingClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4B5563] mb-1.5 text-center">
                      液體形式？
                    </label>
                    <div className="flex justify-center items-center h-8">
                      <input
                        type="checkbox"
                        checked={isLiquid}
                        onChange={(e) => setIsLiquid(e.target.checked)}
                        className={`w-4 h-4 text-emerald-500 border-[#E5E7EB] bg-[#F9FAFB] rounded cursor-pointer`}
                        style={{ accentColor: currentTheme.primary }}
                      />
                      <span className="text-xs text-[#4B5563] ml-1.5">是 (以毫升計)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Twin Nutrition forms: per serving vs per 100g */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#E5E7EB]">
                
                {/* COLUMN A: PER SERVING */}
                <div className="bg-[#F9FAFB] p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#E5E7EB] mb-4">
                    <span className="font-extrabold text-xs text-[#111827]">
                      (一) 「每份量 (Per Serving)」之營養標示數據值
                    </span>
                    <button
                      type="button"
                      onClick={() => syncNutrients("perServingTo100")}
                      className={`p-1.5 px-3 ${currentTheme.bg} hover:brightness-110 text-white font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1 transition-all shadow-md`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      依比例推算 ➡ 每100g
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(NUTRITION_LABELS) as Array<keyof NutritionValues>).map((key) => (
                      <div key={key}>
                        <label className="block text-[10px] font-extrabold text-[#4B5563] mb-1">
                          {NUTRITION_LABELS[key].label} ({NUTRITION_LABELS[key].unit})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min={0}
                          value={perServingForm[key] || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setPerServingForm({
                              ...perServingForm,
                              [key]: isNaN(val) ? 0 : val
                            });
                          }}
                          className={`w-full px-2.5 py-1.5 border border-[#E5E7EB] bg-white text-[#111827] rounded-md text-xs font-mono focus:outline-none focus:ring-2 ${focusRingClass}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMN B: PER 100G */}
                <div className="bg-[#F9FAFB] p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#E5E7EB] mb-4">
                    <span className="font-extrabold text-xs text-[#111827]">
                      (二) 「每 100 公克/毫升 (Per 100g/ml)」之營養數據值
                    </span>
                    <button
                      type="button"
                      onClick={() => syncNutrients("per100ToServing")}
                      className={`p-1.5 px-3 ${currentTheme.bg} hover:brightness-110 text-white font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1 transition-all shadow-md`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      依比例推算 ⬅ 每份
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(NUTRITION_LABELS) as Array<keyof NutritionValues>).map((key) => (
                      <div key={key}>
                        <label className="block text-[10px] font-extrabold text-[#4B5563] mb-1">
                          {NUTRITION_LABELS[key].label} ({NUTRITION_LABELS[key].unit})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min={0}
                          value={per100gForm[key] || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setPer100gForm({
                              ...per100gForm,
                              [key]: isNaN(val) ? 0 : val
                            });
                          }}
                          className={`w-full px-2.5 py-1.5 border border-[#E5E7EB] bg-white text-[#111827] rounded-md text-xs font-mono focus:outline-none focus:ring-2 ${focusRingClass}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Version audit description text */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <label className="block text-xs font-bold text-[#4B5563] mb-1.5 font-sans">
                  此版本異動描述紀錄 (會寫入該食品之更新紀錄歷史中)
                </label>
                <input
                  type="text"
                  placeholder={editingId ? "例如：修正精確蛋白質標記數值" : "例如：新增商品基礎營養素條目"}
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  className={`w-full px-3 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-zinc-400 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 ${focusRingClass}`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-[#E5E7EB] text-[#4B5563] bg-[#F3F4F6] hover:bg-[#E5E7EB] font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  重設表單
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 ${currentTheme.bg} hover:brightness-110 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md flex items-center gap-1 transition-all`}
                >
                  <Save className="w-4 h-4" />
                  保存此筆食品數據並發行版本
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: Change Logs and Version Timeline */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-[#111827] border-b border-[#E5E7EB] pb-3.5 mb-2">
              全食物營養數據庫 版本更新歷史審計軌跡
            </h3>

            {allLogs.length === 0 ? (
              <div className="py-12 text-center text-[#4B5563] text-xs">
                尚無任何資料庫異動資訊。
              </div>
            ) : (
              <div className="relative border-l-2 border-[#E5E7EB] ml-4 pl-6 space-y-6 py-2">
                {allLogs.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Tick indicator */}
                    <span 
                      className={`absolute -left-10 top-0.5 bg-white rounded-full ${currentTheme.text} p-1 border-2 flex items-center justify-center`}
                      style={{ borderColor: currentTheme.primary }}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm max-w-2xl text-[#1F2937]">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span 
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F3F4F6] ${currentTheme.text} uppercase tracking-widest leading-none`}
                          style={{ border: `1px solid ${currentTheme.primary}40` }}
                        >
                          {log.action === "system_init" ? "系統預置" : log.action === "create" ? "全新建立" : "修正更新"}
                        </span>
                        <span className="text-xs text-[#4B5563] font-mono">{log.timestamp}</span>
                      </div>

                      <div className={`font-extrabold text-xs ${currentTheme.text} mt-1.5`}>
                        食品目標：{log.foodName}
                      </div>

                      <p className="text-xs text-[#4B5563] leading-normal mt-1.5 font-sans">
                        {log.description}
                      </p>

                      <div className="text-[10px] text-[#4B5563]/80 mt-2 flex justify-between">
                        <span>修訂主體：{log.author}</span>
                        <span>版本編號: {log.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
