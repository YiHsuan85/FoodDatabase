/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FoodItem, NUTRITION_LABELS, NutritionValues } from "../types";
import { ShieldCheck, CalendarRange, Trash2, Edit } from "lucide-react";
import { ThemeColors, THEME_PRESETS } from "../themes";

interface NutritionCardProps {
  key?: string | number;
  food: FoodItem;
  onAddToCompare?: (food: FoodItem) => void;
  isCompared?: boolean;
  onEdit?: (food: FoodItem) => void;
  onDelete?: (food: FoodItem) => void;
  isAdmin?: boolean;
  showCompact?: boolean;
  theme?: ThemeColors;
}

export default function NutritionCard({ 
  food, 
  onAddToCompare, 
  isCompared = false, 
  onEdit, 
  onDelete, 
  isAdmin = false,
  showCompact = false,
  theme
}: NutritionCardProps) {
  const currentTheme = theme || THEME_PRESETS[0];
  const [viewMode, setViewMode] = useState<"perServing" | "per100g">("perServing");

  const values: NutritionValues = food[viewMode];

  // Helper to format values elegantly (round to 1 decimal place if float)
  const f = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "0";
    return Number(val.toFixed(2)).toString();
  };

  const unitType = food.isLiquid ? "毫升" : "公克";

  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md hover:${currentTheme.borderLight} transition-all p-5 flex flex-col justify-between h-full text-[#1F2937]`}>
      
      {/* Top Details & Action */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${currentTheme.bgLight} ${currentTheme.text} mb-1.5 border ${currentTheme.borderLight}`}>
              {food.category}
            </span>
            <h3 className="font-sans text-lg font-bold text-[#111827] tracking-tight leading-snug">
              {food.brand ? `${food.brand} - ` : ""}{food.name}
            </h3>
          </div>
          {onAddToCompare && (
            <button
               onClick={() => onAddToCompare(food)}
               className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                 isCompared 
                   ? `${currentTheme.bg} text-white border-transparent ${currentTheme.bgHover}` 
                   : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB] hover:text-[#111827]"
               }`}
            >
              {isCompared ? "已在比較中" : "+ 加入比較"}
            </button>
          )}
        </div>

        {/* Barcode & Description */}
        <div className="text-xs font-mono text-[#4B5563] mb-4 flex flex-wrap gap-x-3 items-center">
          <span>條碼：{food.barcode || "無條碼資訊"}</span>
          <span>•</span>
          <span>{food.servingSizeText}</span>
        </div>

        {/* Nutrition Standard Table (Taiwanese Grocery Style in Light mode) */}
        <div className="border border-black bg-white p-4 font-sans text-xs text-black max-w-sm mx-auto mb-4 tracking-normal leading-relaxed rounded shadow-sm">
          
          {/* Table Header Controls */}
          <div className="flex items-center justify-between border-b border-black pb-2 mb-2">
            <span className="font-extrabold text-sm tracking-wide text-black">營養標示</span>
            <div className="flex bg-[#F3F4F6] p-0.5 rounded-md text-[10px] border border-[#E5E7EB]">
              <button 
                onClick={() => setViewMode("perServing")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${viewMode === "perServing" ? `${currentTheme.bg} text-white shadow-sm` : "text-[#4B5563] hover:text-black"}`}
              >
                每份
              </button>
              <button 
                onClick={() => setViewMode("per100g")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${viewMode === "per100g" ? `${currentTheme.bg} text-white shadow-sm` : "text-[#4B5563] hover:text-black"}`}
              >
                每100{unitType}
              </button>
            </div>
          </div>

          <div className="border-b border-black pb-1.5 mb-1.5 text-zinc-700">
            <div>{food.servingSizeText}</div>
            <div className="font-bold mt-0.5 text-black">
              {viewMode === "perServing" 
                ? `本包裝單份量：約 ${food.servingValue} ${unitType}` 
                : `每 100 ${unitType} 標示值`
              }
            </div>
          </div>

          {/* Sub Header columns */}
          <div className="grid grid-cols-2 font-bold mb-1 border-b-2 border-black pb-0.5 text-[10px] text-zinc-700">
            <span>項目</span>
            <span className="text-right">
              含量 ({viewMode === "perServing" ? "每份" : `每100${unitType}`})
            </span>
          </div>

          {/* Core Nutrient Rows */}
          <div className="space-y-1 divide-y divide-zinc-200">
            <div className="grid grid-cols-2 font-bold pt-1">
              <span>熱量 Energy</span>
              <span className={`text-right ${currentTheme.text}`}>{f(values.energy)} kcal</span>
            </div>
            
            <div className="grid grid-cols-2 font-bold pt-1">
              <span>蛋白質 Protein</span>
              <span className="text-right text-black">{f(values.protein)} g</span>
            </div>

            <div className="pt-1">
              <div className="grid grid-cols-2 font-bold">
                <span>脂肪 Fat</span>
                <span className="text-right">{f(values.fat)} g</span>
              </div>
              <div className="pl-4 grid grid-cols-2 text-zinc-600 pt-0.5 text-[11px]">
                <span>- 飽和脂肪 Saturated</span>
                <span className="text-right">{f(values.saturatedFat)} g</span>
              </div>
              <div className="pl-4 grid grid-cols-2 text-zinc-600 text-[11px]">
                <span>- 反式脂肪 Trans</span>
                <span className="text-right">{f(values.transFat)} g</span>
              </div>
            </div>

            <div className="grid grid-cols-2 pt-1">
              <span>膽固醇 Cholesterol</span>
              <span className="text-right">{f(values.cholesterol)} mg</span>
            </div>

            <div className="pt-1">
              <div className="grid grid-cols-2 font-bold">
                <span>碳水化合物 Carbohydrate</span>
                <span className="text-right">{f(values.carbohydrate)} g</span>
              </div>
              <div className="pl-4 grid grid-cols-2 text-zinc-600 pt-0.5 text-[11px]">
                <span>- 糖 Sugar</span>
                <span className="text-right">{f(values.sugar)} g</span>
              </div>
              <div className="pl-4 grid grid-cols-2 text-zinc-600 text-[11px]">
                <span>- 膳食纖維 Fiber</span>
                <span className={`text-right ${currentTheme.text}`}>{f(values.fiber)} g</span>
              </div>
            </div>

            <div className="grid grid-cols-2 font-bold pt-1 border-b border-black pb-1">
              <span>鈉 Sodium</span>
              <span className="text-right text-rose-600">{f(values.sodium)} mg</span>
            </div>

            {/* Micronutrient Drawer */}
            <div className="pt-1.5 text-[11px] text-zinc-700 bg-zinc-50 px-1.5 py-1.5 rounded border border-zinc-200">
              <div className={`font-semibold ${currentTheme.text} mb-1 text-[9px] uppercase tracking-wide`}>
                微量元素 & 礦物質
              </div>
              <div className="grid grid-cols-3 gap-y-1.5 gap-x-2">
                <div className="flex justify-between border-b border-dashed border-zinc-200">
                  <span className="text-zinc-600 font-medium">鈣</span>
                  <span className="font-extrabold text-zinc-900">{f(values.calcium)}<span className="text-[8px] font-medium text-zinc-500">mg</span></span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200">
                  <span className="text-zinc-600 font-medium">鉀</span>
                  <span className="font-extrabold text-zinc-900">{f(values.potassium)}<span className="text-[8px] font-medium text-zinc-500">mg</span></span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200">
                  <span className="text-zinc-600 font-medium">磷</span>
                  <span className="font-extrabold text-zinc-900">{f(values.phosphorus)}<span className="text-[8px] font-medium text-zinc-500">mg</span></span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200">
                  <span className="text-zinc-600 font-medium">鎂</span>
                  <span className="font-extrabold text-zinc-900">{f(values.magnesium)}<span className="text-[8px] font-medium text-zinc-500">mg</span></span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200">
                  <span className="text-zinc-600 font-medium">鋅</span>
                  <span className="font-extrabold text-zinc-900">{f(values.zinc)}<span className="text-[8px] font-medium text-zinc-500">mg</span></span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200">
                  <span className="text-zinc-600 font-medium">鐵</span>
                  <span className="font-extrabold text-zinc-900">{f(values.iron)}<span className="text-[8px] font-medium text-zinc-500">mg</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Logs / Admin Options */}
      <div className="border-t border-[#E5E7EB] pt-3 mt-2 flex flex-col gap-2">
        {food.history && food.history.length > 0 && (
          <div className="text-[10px] text-[#4B5563] bg-[#F9FAFB] p-2 rounded-lg leading-relaxed border border-[#E5E7EB]">
            <div className={`flex items-center gap-1 font-semibold ${currentTheme.text} mb-0.5 uppercase tracking-wider text-[9px]`}>
              <CalendarRange className={`w-3 h-3 ${currentTheme.text}`} />
              最近更新歷史
            </div>
            <div className="truncate text-[#1F2937]">
              {food.history[0].timestamp} • {food.history[0].description}
            </div>
            {food.history.length > 1 && (
              <div className="text-[9px] text-[#4B5563] mt-0.5">
                共有 {food.history.length} 個版本變更歷史紀錄
              </div>
            )}
          </div>
        )}

        {isAdmin && onEdit && onDelete && (
          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-dashed border-[#E5E7EB] justify-end">
            <button
              onClick={() => onEdit(food)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold ${currentTheme.text} border ${currentTheme.borderLight} rounded-md hover:${currentTheme.bgLight} cursor-pointer transition-colors`}
            >
              <Edit className="w-3.5 h-3.5" />
              編輯數據
            </button>
            <button
              onClick={() => onDelete(food)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-500 border border-rose-205 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              刪除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
