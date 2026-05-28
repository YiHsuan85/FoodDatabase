/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { FoodItem, FOOD_CATEGORIES, NutritionValues, VersionLog } from "./types";
import NutritionCard from "./components/NutritionCard";
import ComparePanel from "./components/ComparePanel";
import AdminPanel from "./components/AdminPanel";
import BarcodeScannerSim from "./components/BarcodeScannerSim";
import { ThemeColors, THEME_PRESETS, getStoredTheme } from "./themes";
import { 
  Search, 
  Sparkles, 
  Scale, 
  Settings, 
  HelpCircle, 
  Scan, 
  FileText, 
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  Flame,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(getStoredTheme());

  const handleThemeChange = (theme: ThemeColors) => {
    setCurrentTheme(theme);
    localStorage.setItem("smartfood_theme_id", theme.id);
  };

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Navigation tab: 'explore' | 'compare' | 'admin'
  const [activeTab, setActiveTab] = useState<"explore" | "compare" | "admin">("explore");

  // Query states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [activeSmartTag, setActiveSmartTag] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<string>("default");

  // Barcode Scanner Modal State
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannedFeedback, setScannedFeedback] = useState<{ food: FoodItem; timestamp: string } | null>(null);

  // Compare states list
  const [selectedCompareFoods, setSelectedCompareFoods] = useState<FoodItem[]>([]);

  // Detail Modal State (double click to open nutrition card)
  const [selectedDetailFood, setSelectedDetailFood] = useState<FoodItem | null>(null);

  // Fetch foods on mount
  useEffect(() => {
    setLoading(true);
    setErrorMessage("");
    const pathForOnSnapshot = 'foods';
    const unsubscribe = onSnapshot(collection(db, pathForOnSnapshot), (snapshot) => {
      const dbFoods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));
      // Sort logic might be on client, but let's just return what we have
      setFoods(dbFoods as any);
      setLoading(false);
    }, (error) => {
      setErrorMessage("無法連接到 Firebase Firestore 伺服器，或權限不足。");
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Admin save callback
  const handleSaveFood = async (newFood: Omit<FoodItem, "history">, desc?: string): Promise<boolean> => {
    try {
      const existingFood = foods.find(f => f.id === newFood.id || (newFood.barcode && f.barcode === newFood.barcode && f.barcode !== ""));
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      if (existingFood) {
        const changes: string[] = [];
        if (existingFood.name !== newFood.name) changes.push(`名稱由「${existingFood.name}」改為「${newFood.name}」`);
        if (existingFood.category !== newFood.category) changes.push(`類別改為「${newFood.category}」`);
        
        const descLog = desc || (changes.length > 0 ? `更新了商品內容` : "更新商品營養資訊");
        const newLog = {
          id: "v-" + Math.random().toString(36).substr(2, 9),
          timestamp,
          action: "update" as const,
          description: descLog,
          author: "管理者 (Google Auth)"
        };

        const finalHistory = [newLog, ...(existingFood.history || [])];
        const updatedFood = { ...newFood, id: existingFood.id, history: finalHistory };
        await setDoc(doc(db, "foods", updatedFood.id), updatedFood);
        return true;
      } else {
        const newId = newFood.id || "food-" + Math.random().toString(36).substr(2, 9);
        const newLog = {
          id: "v-" + Math.random().toString(36).substr(2, 9),
          timestamp,
          action: "create" as const,
          description: desc || "新增防拷食物數據，建立首個版本型號紀錄",
          author: "管理者 (Google Auth)"
        };
        const food = { ...newFood, id: newId, history: [newLog] };
        await setDoc(doc(db, "foods", food.id), food);
        return true;
      }
    } catch (err) {
      console.error(err);
      alert("儲存至雲端資料庫發生權限拒絕或網路阻礙");
      return false;
    }
  };

  // Admin delete callback
  const handleDeleteFood = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "foods", id));
      setSelectedCompareFoods(selectedCompareFoods.filter((f) => f.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("網路異常或權限不足，刪除失敗");
      return false;
    }
  };

  // Add/Remove from compare array
  const handleToggleCompare = (food: FoodItem) => {
    const isSelected = selectedCompareFoods.some((f) => f.id === food.id);
    if (isSelected) {
      setSelectedCompareFoods(selectedCompareFoods.filter((f) => f.id !== food.id));
    } else {
      if (selectedCompareFoods.length >= 3) {
        alert("基於直觀對比考量，系統至多支援 3 件商品同時比較，請先取消其一。");
        return;
      }
      setSelectedCompareFoods([...selectedCompareFoods, food]);
    }
  };

  // Barcode scanned event coordinator
  const handleBarcodeDetected = (barcode: string) => {
    const trimmed = barcode.trim();
    const matched = foods.find((f) => f.barcode === trimmed);

    if (matched) {
      setScannedFeedback({
        food: matched,
        timestamp: new Date().toLocaleTimeString()
      });
      // Scroll to view & open explore tab
      setActiveTab("explore");
      // Pre-fill search query with name to make it show up instantly
      setSearchQuery(matched.name);
      setSelectedCategory("全部");
      setActiveSmartTag("全部");
    } else {
      alert(`掃描成功，獲得條碼代號：${trimmed}。但目前該條碼未登錄於系統食物資料庫中。請點選上方「⚙️智慧管理後台」進入手動或照相 OCR 新增錄入此產品！`);
    }
    setShowScanner(false);
  };

  // Smart label checks list
  const getSmartTagsForFood = (food: FoodItem): string[] => {
    const tags: string[] = [];
    
    // Check Latest Added (added or created log in database, or first 2 items)
    const isRecent = food.history && food.history.some((h) => h.action === "create" || h.action === "system_init");
    if (isRecent) {
      // In our mock, items in the db are structured, we consider top 3 recent
      const index = foods.findIndex((f) => f.id === food.id);
      if (index >= 0 && index < 3) {
        tags.push("最新加入");
      }
    }

    // High Protein >= 10g per serving OR per 100g
    if (food.perServing.protein >= 10 || food.per100g.protein >= 10) {
      tags.push("高蛋白質");
    }

    // Low Sodium <= 120mg per 100ml / 100g (台湾低鈉官方規範)
    if (food.per100g.sodium <= 120) {
      tags.push("低鈉");
    }

    // High Fiber: fiber >= 3g per serving or per 100g
    if (food.perServing.fiber >= 3 || food.per100g.fiber >= 3) {
      tags.push("高纖維");
    }

    // Vegetarian friendly
    const vegCategories = ["新鮮蔬菜", "當季水果", "穀物雜糧", "堅果種子", "堅果種子類"];
    const nonVegCategories = ["肉類與蛋", "海鮮水產"];
    if (vegCategories.includes(food.category)) {
      tags.push("素食友善");
    } else if (!nonVegCategories.includes(food.category) && food.name.indexOf("雞") === -1 && food.name.indexOf("肉") === -1 && food.name.indexOf("魚") === -1) {
      // General checking of soy milks, nuts, etc.
      tags.push("素食友善");
    }

    // Low Calorie: energy <= 40kcal per 100g/ml
    if (food.per100g.energy <= 40) {
      tags.push("低卡/低脂");
    }

    return tags;
  };

  // Dynamic filter lists
  const filteredFoods = foods.filter((food) => {
    // 1. Search Query mapping
    const matchesSearch = 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (food.barcode && food.barcode.includes(searchQuery));

    // 2. Category mapping
    const matchesCategory = selectedCategory === "全部" || food.category === selectedCategory;

    // 3. Smart Tags mapping
    let matchesSmartTag = true;
    if (activeSmartTag !== "全部") {
      const foodTags = getSmartTagsForFood(food);
      matchesSmartTag = foodTags.includes(activeSmartTag);
    }

    return matchesSearch && matchesCategory && matchesSmartTag;
  });

  // Apply sorting
  const sortedAndFilteredFoods = [...filteredFoods].sort((a, b) => {
    if (sortBy === "energy_asc") {
      return a.perServing.energy - b.perServing.energy;
    }
    if (sortBy === "energy_desc") {
      return b.perServing.energy - a.perServing.energy;
    }
    if (sortBy === "protein_desc") {
      return b.per100g.protein - a.per100g.protein;
    }
    if (sortBy === "sodium_asc") {
      return a.per100g.sodium - b.per100g.sodium;
    }
    // Default system order
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans antialiased">
      
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#E5E7EB] shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-18 flex flex-col md:flex-row items-center justify-between py-2 md:py-0 gap-2.5 md:gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${currentTheme.bg} text-white rounded-xl shadow-md cursor-pointer`} onClick={() => setActiveTab("explore")}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#111827]">
                SmartFood <span className={`${currentTheme.text} font-bold`}>智慧營養數據庫</span>
              </h1>
              <p className="text-[10px] text-[#4B5563]">食品溯源 • 對比對抗 • AI OCR智慧管理系統</p>
            </div>
          </div>

          {/* Quick Theme Presets */}
          <div className="flex items-center gap-3">
            {/* Desktop Theme Presets Selection Panel */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full">
              <span className="text-[9px] font-black text-[#4B5563] mr-1 uppercase tracking-wider">版面配色:</span>
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleThemeChange(preset)}
                  title={preset.name}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all flex items-center justify-center text-[10px] ${
                    currentTheme.id === preset.id 
                      ? `scale-110 shadow-lg border-2` 
                      : `opacity-65 hover:opacity-100 hover:scale-105 border border-[#E5E7EB]`
                  }`}
                  style={{ 
                    borderColor: preset.primary,
                    backgroundColor: currentTheme.id === preset.id ? preset.primary + "20" : '#FFFFFF',
                    boxShadow: currentTheme.id === preset.id ? `0 0 8px ${preset.primary}40` : ''
                  }}
                >
                  {preset.emoji}
                </button>
              ))}
            </div>

            {/* Mobile Theme Presets (mini round dots) */}
            <div className="flex sm:hidden items-center gap-1 bg-[#F3F4F6] p-1 rounded-full border border-[#E5E7EB]">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleThemeChange(preset)}
                  title={preset.name}
                  className={`w-5 h-5 rounded-full cursor-pointer transition-all flex items-center justify-center text-[8px] border ${
                    currentTheme.id === preset.id ? 'scale-110 border-white' : 'border-transparent opacity-60'
                  }`}
                  style={{ 
                    backgroundColor: preset.primary,
                  }}
                >
                  {preset.emoji}
                </button>
              ))}
            </div>

            {/* Nav Tabs */}
            <nav className="flex space-x-1 bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB]">
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                  activeTab === "explore" 
                    ? `${currentTheme.bg} text-white shadow-sm` 
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                前台食物查詢
              </button>
              <button
                onClick={() => setActiveTab("compare")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 relative ${
                  activeTab === "compare" 
                    ? `${currentTheme.bg} text-white shadow-sm` 
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                對抗比較
                {selectedCompareFoods.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white animate-bounce">
                    {selectedCompareFoods.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                  activeTab === "admin" 
                    ? `${currentTheme.bg} text-white shadow-sm` 
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                智慧管理
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Scanned successful banner notification feedback */}
        {scannedFeedback && (
          <div className={`mb-6 p-4 bg-white border ${currentTheme.borderLight50} rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-fade-in text-[#1F2937]`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 ${currentTheme.bgLight} ${currentTheme.text} ring-4 ring-neutral-50 rounded-xl`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#111827]">條碼比對完美成功！</h4>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  已於 {scannedFeedback.timestamp} 成功掃描商品 [ {scannedFeedback.food.brand ? `${scannedFeedback.food.brand} - ` : ""}{scannedFeedback.food.name} ]，並已為您過濾顯示數值。
                </p>
              </div>
            </div>
            <button
              onClick={() => { setScannedFeedback(null); setSearchQuery(""); }}
              className="text-[#4B5563] hover:text-[#111827] cursor-pointer p-1"
              title="清除過濾"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic content rendering based on Active Tab */}

        {/* TAB 1: Explore and Query Section */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            
            {/* Header description */}
            <div className="bg-gradient-to-r from-white to-[#F9FAFB] border border-[#E5E7EB] p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#111827] tracking-tight">🔎 食品營養數據標示檢索庫</h2>
                <p className="text-xs text-[#4B5563] max-w-xl leading-relaxed">
                  免登入前台版面！支援左側類別/特徵雙重篩選，滑鼠雙點擊任一食物即可觀看最詳盡的台灣食品營養標示標準面板及追蹤對比。
                </p>
              </div>

              {/* Glowing active barcode scan trigger */}
              <button
                onClick={() => setShowScanner(true)}
                className={`py-3 px-5 ${currentTheme.bg} border border-transparent ${currentTheme.bgHover} text-white font-bold text-sm rounded-2xl cursor-pointer flex items-center gap-2 transition-all shadow-md ${currentTheme.shadow}`}
              >
                <Scan className="w-4 h-4 text-white animate-pulse" />
                開啟智慧條碼掃描
              </button>
            </div>

            {/* BARCODE SCANNER MODAL WRAPPER */}
            {showScanner && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="w-full max-w-lg">
                  <BarcodeScannerSim 
                    foods={foods} 
                    onBarcodeDetected={handleBarcodeDetected}
                    onClose={() => setShowScanner(false)}
                  />
                </div>
              </div>
            )}

            {/* TWO-COLUMN SIDEBAR LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* LEFT COLUMN: Food Categories & Filter system */}
              <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-5">
                
                {/* 1. Category selector block */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                  <div className="border-b border-[#F3F4F6] pb-2.5 flex items-center justify-between">
                    <span className="block text-xs font-black text-[#111827] uppercase tracking-wider">
                      按食物類別篩選
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded-full">
                      {FOOD_CATEGORIES.length + 1} 類
                    </span>
                  </div>
                  <div className="flex lg:flex-col flex-row flex-wrap gap-1">
                    {["全部", ...FOOD_CATEGORIES].map((cat) => {
                      const isActive = selectedCategory === cat;
                      const count = cat === "全部" ? foods.length : foods.filter(f => f.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left flex-grow lg:flex-grow-0 ${
                            isActive 
                              ? `${currentTheme.bg} text-white shadow-sm font-bold` 
                              : "bg-[#F9FAFB] lg:bg-transparent text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                          }`}
                        >
                          <span className="truncate pr-2">{cat}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Smart dynamic Tag filtering system */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                  <div className="border-b border-[#F3F4F6] pb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="block text-xs font-black text-[#111827] uppercase tracking-wider">
                      智慧特徵篩選
                    </span>
                  </div>
                  <div className="flex lg:flex-col flex-row flex-wrap gap-1">
                    {[
                      { label: "全部特徵", value: "全部", emoji: "✨" },
                      { label: "最新加入 🆕", value: "最新加入", emoji: "🆕" },
                      { label: "高蛋白質 🥩", value: "高蛋白質", emoji: "🥩" },
                      { label: "低鈉健美 🥗", value: "低鈉", emoji: "🥗" },
                      { label: "高膳食纖維 🥦", value: "高纖維", emoji: "🥦" },
                      { label: "素食友善 🥕", value: "素食友善", emoji: "🥕" },
                      { label: "低卡路里 🥤", value: "低卡/低脂", emoji: "🥤" }
                    ].map((tag) => {
                      const isActive = activeSmartTag === tag.value;
                      return (
                        <button
                          key={tag.value}
                          onClick={() => setActiveSmartTag(tag.value)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left flex-grow lg:flex-grow-0 border lg:border-transparent ${
                            isActive 
                              ? `${currentTheme.bg} text-white border-transparent shadow-sm font-bold` 
                              : "bg-[#F9FAFB] lg:bg-transparent text-[#4B5563] border-[#E5E7EB] lg:border-none hover:bg-[#F3F4F6] hover:text-[#111827]"
                          }`}
                        >
                          <span className="text-xs">{tag.emoji}</span>
                          <span className="truncate">{tag.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Search Header & Food Name Grid */}
              <div className="flex-grow space-y-5">
                
                {/* Search Bar & Sorter */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row items-center gap-3">
                  
                  {/* Search Input */}
                  <div className="relative flex-grow w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="搜尋食品名稱、品牌或 13 碼條碼..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-12 py-2.5 border border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 ${currentTheme.focusRing} text-[#111827] placeholder-[#9CA3AF] bg-white`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#4B5563] hover:text-[#111827] text-xs font-semibold"
                      >
                        清除
                      </button>
                    )}
                  </div>

                  {/* Soreby drop list */}
                  <div className="relative w-full sm:w-56 flex-shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 border border-[#E5E7EB] bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 ${currentTheme.focusRing} text-[#1F2937]`}
                    >
                      <option value="default">預設排序 (最新上線)</option>
                      <option value="energy_asc">每份熱量：由低到高</option>
                      <option value="energy_desc">每份熱量：由高到低</option>
                      <option value="protein_desc">百克蛋白質：由高到低</option>
                      <option value="sodium_asc">百克鈉含量：由低到高</option>
                    </select>
                  </div>

                </div>

                {/* FOOD LIST RESULTS OR STATUS */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
                    <Loader2 className={`w-10 h-10 animate-spin ${currentTheme.text}`} />
                    <p className="text-xs text-[#4B5563] mt-2 font-medium">正在載入食品數據，請稍後...</p>
                  </div>
                ) : sortedAndFilteredFoods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#E5E7EB] rounded-2xl text-center px-4 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-[#9CA3AF] mb-2" />
                    <h3 className="font-bold text-[#111827] text-sm">找不到任何符合條件的食物</h3>
                    <p className="text-xs text-[#4B5563] max-w-sm mt-1 leading-relaxed">
                      試著調整搜尋字眼，或按下方「重設篩選」清除特定智慧標籤。
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("全部");
                        setActiveSmartTag("全部");
                        setSortBy("default");
                      }}
                      className={`mt-4 px-4 py-2 ${currentTheme.bg} ${currentTheme.bgHover} text-white rounded-xl text-xs font-bold cursor-pointer transition-all`}
                    >
                      重設所有篩選
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1.5 gap-1 text-[11px] text-[#4B5563]">
                      <span>
                        已過濾顯示 <strong>{sortedAndFilteredFoods.length}</strong> 款產品 (資料庫中共有 {foods.length} 款)
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        💡 滑鼠雙擊食物卡片，即可開啟「完整營養成分標示及異動歷史」面板對比。
                      </span>
                    </div>

                    {/* RENDER COMPACT FOOD NAME ITEMS ONLY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                      {sortedAndFilteredFoods.map((food) => {
                        const isCompared = selectedCompareFoods.some((f) => f.id === food.id);
                        return (
                          <div 
                            key={food.id}
                            onDoubleClick={() => setSelectedDetailFood(food)}
                            className="group bg-white border border-[#E5E7EB] hover:border-gray-300 hover:shadow-md rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between relative select-none overflow-hidden"
                            title="雙擊滑鼠直接開啟詳細台灣國家標準營養標示與異動時間軸"
                          >
                            <div className="space-y-2">
                              {/* Brand and category mini indicators */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-500 truncate max-w-[130px]">
                                  {food.brand ? food.brand : "國家基準數據"}
                                </span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${currentTheme.bgLight} ${currentTheme.text}`}>
                                  {food.category}
                                </span>
                              </div>

                              {/* FOOD NAME DISPLAY AS PRIMARY SPECIFICATION */}
                              <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-transform duration-100 line-clamp-2 leading-relaxed h-10 flex items-center pr-4">
                                {food.name}
                              </h4>
                            </div>

                            {/* Card sub-footer with quick stats & actions */}
                            <div className="mt-3 pt-2 w-full border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                              <span>每 100g 含有: {food.per100g.protein}g 蛋白</span>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDetailFood(food);
                                }}
                                className="text-gray-400 hover:text-gray-700 font-extrabold flex items-center"
                              >
                                🔍 特徵詳情
                              </button>
                            </div>

                            {/* Comparison Add badge directly on the compact card */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCompare(food);
                              }}
                              className={`absolute top-2 right-2 p-1 bg-[#F9FAFB] border border-gray-100 rounded-lg group-hover:opacity-100 transition-all z-10 ${
                                isCompared ? 'opacity-100 text-rose-500 border-rose-200 bg-rose-50' : 'opacity-0 text-gray-400 hover:text-gray-600'
                              }`}
                              title={isCompared ? "取消對比" : "加入對抗比較"}
                            >
                              <Scale className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* DETAIL MODAL FOR FOOD NUTRITION DISPLAY (TRIGGERED ON DOUBLE CLICK) */}
            {selectedDetailFood && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
                onClick={() => setSelectedDetailFood(null)}
              >
                <div 
                  className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-8 relative animate-[scale-up_0.2s_ease-out]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] p-5 flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${currentTheme.bgLight} ${currentTheme.text} border ${currentTheme.borderLight}`}>
                        {selectedDetailFood.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-gray-800 mt-1 max-w-[420px] truncate">
                        {selectedDetailFood.brand ? `[${selectedDetailFood.brand}] ` : ""}{selectedDetailFood.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedDetailFood(null)}
                      className="p-1 px-3.5 bg-[#F3F4F6] text-gray-500 hover:text-gray-800 hover:bg-[#E5E7EB] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> 關閉 (Esc)
                    </button>
                  </div>

                  {/* Modal Content container */}
                  <div className="p-6 max-h-[64vh] overflow-y-auto space-y-6">
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 text-[11px] text-amber-800 leading-relaxed font-semibold">
                      📊 此面板為台灣衛福部食品標準格式，雙面切換包含每一份量及每 100 公克之微量元素微調。
                    </div>

                    <NutritionCard
                      food={selectedDetailFood}
                      onAddToCompare={handleToggleCompare}
                      isCompared={selectedCompareFoods.some((f) => f.id === selectedDetailFood.id)}
                      theme={currentTheme}
                    />

                    {selectedDetailFood.history && selectedDetailFood.history.length > 0 && (
                      <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                        <h4 className="text-xs font-black text-gray-700 flex items-center gap-1">
                          📋 此食物條款之修訂及審計軌跡
                        </h4>
                        <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB] space-y-3">
                          {selectedDetailFood.history.map((log) => (
                            <div key={log.id} className="text-xs flex items-start justify-between gap-4 border-b border-dashed border-gray-200 pb-3 last:border-0 last:pb-0">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${currentTheme.bgLight} ${currentTheme.text}`}>
                                    {log.action === "create" ? "系統首錄" : log.action === "system_init" ? "預置範本" : "修正修訂"}
                                  </span>
                                  <span className="font-extrabold text-gray-700">{log.author}</span>
                                </div>
                                <p className="text-[#4B5563] mt-1 leading-relaxed text-[11px]">{log.description}</p>
                              </div>
                              <span className="font-mono text-[10px] text-[#9CA3AF] flex-shrink-0">{log.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Action footer */}
                  <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] p-4 px-6 flex justify-between items-center">
                    <button
                      onClick={() => {
                        handleToggleCompare(selectedDetailFood);
                        setSelectedDetailFood(null);
                      }}
                      className={`py-2 px-4.5 ${currentTheme.bg} ${currentTheme.bgHover} text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      {selectedCompareFoods.some((f) => f.id === selectedDetailFood.id) ? "取消加入對盤比較" : "加入對抗評測比較"}
                    </button>
                    <button
                      onClick={() => setSelectedDetailFood(null)}
                      className="py-2 px-5 bg-[#F3F4F6] text-gray-650 hover:text-gray-900 font-extrabold text-xs rounded-xl cursor-pointer"
                    >
                      完成檢視 ✅
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Drawer at bottom: selected compared items fast tracking popup */}
            {selectedCompareFoods.length > 0 && (
              <div className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto bg-white text-[#1F2937] p-4 px-5 rounded-2xl shadow-xl border border-[#E5E7EB] flex items-center justify-between gap-4 z-45 animate-[slide-up_0.3s_ease-out]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F3F4F6] rounded-xl relative">
                    <Scale className={`w-4 h-4 ${currentTheme.text}`} />
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {selectedCompareFoods.length}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs">已選取對比評估產品：</h5>
                    <p className="text-[10px] text-[#4B5563] mt-0.5 truncate max-w-[280px]">
                      {selectedCompareFoods.map((f) => f.name).join(" vs ")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-center">
                  <button
                    onClick={() => setSelectedCompareFoods([])}
                    className="text-xs text-[#4B5563] hover:text-[#111827] font-medium cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => setActiveTab("compare")}
                    className={`py-1.5 px-4 ${currentTheme.bg} ${currentTheme.bgHover} text-white rounded-lg text-xs font-bold cursor-pointer transition-colors`}
                  >
                    前往對抗圖表比較 🚀
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Product Visual Comparisons (with checklist toggling) */}
        {activeTab === "compare" && (
          <ComparePanel
            selectedFoods={selectedCompareFoods}
            onRemoveFromCompare={handleToggleCompare}
            onClearCompare={() => setSelectedCompareFoods([])}
            theme={currentTheme}
          />
        )}

        {/* TAB 3: Admin Protected site */}
        {activeTab === "admin" && (
          <AdminPanel
            foods={foods}
            onSaveFood={handleSaveFood}
            onDeleteFood={handleDeleteFood}
            theme={currentTheme}
          />
        )}

      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2 text-[#4B5563] text-xs">
          <p className="font-bold text-[#1F2937]">SmartFood 智慧營養食物標示管理系統 - 2026 研發版</p>
          <p>© Google AI Studio Build - 全語言(繁體中文)響應式設計適用於 Android / iOS / Desktop 全平台。</p>
        </div>
      </footer>

    </div>
  );
}
