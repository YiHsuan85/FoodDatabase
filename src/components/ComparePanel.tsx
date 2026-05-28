/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { FoodItem, NUTRITION_LABELS, NutritionValues } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Scale, CheckSquare, Square, Info, ShieldX } from "lucide-react";
import { ThemeColors, THEME_PRESETS } from "../themes";

interface ComparePanelProps {
  selectedFoods: FoodItem[];
  onRemoveFromCompare: (food: FoodItem) => void;
  onClearCompare: () => void;
  theme?: ThemeColors;
}

export default function ComparePanel({
  selectedFoods,
  onRemoveFromCompare,
  onClearCompare,
  theme
}: ComparePanelProps) {
  const currentTheme = theme || THEME_PRESETS[0];
  const [compareMode, setCompareMode] = useState<"perServing" | "per100g">("perServing");
  
  // By default, select Calories, Protein, Total Fat, and Carbohydrates for comparison
  const [selectedKeys, setSelectedKeys] = useState<Array<keyof NutritionValues>>([
    "energy",
    "protein",
    "fat",
    "carbohydrate"
  ]);

  const toggleKey = (key: keyof NutritionValues) => {
    if (selectedKeys.includes(key)) {
      if (selectedKeys.length > 1) {
        setSelectedKeys(selectedKeys.filter((k) => k !== key));
      }
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  // Convert comparative items into Recharts format
  // Format should be: [ { name: "熱量 (kcal)", "鮮乳": 131, "綜合果": 181 }, ... ]
  const chartData = selectedKeys.map((key) => {
    const labelInfo = NUTRITION_LABELS[key];
    const dataRow: any = {
      name: `${labelInfo.label} (${labelInfo.unit})`,
    };

    selectedFoods.forEach((food) => {
      const value = food[compareMode][key];
      // Use food.name or brand + name as label
      const displayName = food.brand ? `${food.brand}-${food.name}` : food.name;
      dataRow[displayName] = Number(value.toFixed(2));
    });

    return dataRow;
  });

  // Assign beautiful vibrant colors for the compared items based on active theme
  const getComparisonColors = () => {
    const primary = currentTheme.primary;
    if (currentTheme.id === "emerald") {
      return [primary, "#3B82F6", "#F59E0B"];
    }
    if (currentTheme.id === "sapphire") {
      return [primary, "#8B5CF6", "#F59E0B"];
    }
    if (currentTheme.id === "purple") {
      return [primary, "#EF4444", "#3B82F6"];
    }
    if (currentTheme.id === "amber") {
      return [primary, "#10B981", "#3B82F6"];
    }
    if (currentTheme.id === "ruby") {
      return [primary, "#8B5CF6", "#F59E0B"];
    }
    return [primary, "#3B82F6", "#F59E0B"];
  };

  const colors = getComparisonColors();

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#E5E7EB] pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 ${currentTheme.bgLight} ${currentTheme.text} rounded-xl`}>
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#111827] tracking-tight">多品項營養成分對抗比對</h2>
            <p className="text-xs text-[#4B5563]">選取至多三個食物，自訂項目以精美柱型圖與數值表直觀比較。</p>
          </div>
        </div>

        {selectedFoods.length > 0 && (
          <button
            onClick={onClearCompare}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            清除比較清單 ({selectedFoods.length}/3)
          </button>
        )}
      </div>

      {selectedFoods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB] text-center">
          <Scale className="w-12 h-12 text-[#4B5563]/40 mb-3" />
          <h3 className="font-bold text-[#111827] mb-1">尚未選擇比較商品</h3>
          <p className="text-xs text-[#4B5563] max-w-sm leading-relaxed">
            請返回前台的食物清單，點擊卡片右上角的「+ 加入比較」按鈕。至多可挑選 3 款商品進行深入對抗分析。
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Selected Products list pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedFoods.map((food, idx) => {
              const displayName = food.brand ? `[${food.brand}] ${food.name}` : food.name;
              return (
                <div 
                  key={food.id} 
                  className="flex items-center justify-between p-3.5 bg-white border border-[#E5E7EB] rounded-xl shadow-sm relative overflow-hidden"
                >
                  {/* Left color bar indicator */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: colors[idx] }}
                  />
                  <div className="pl-2">
                    <div className="font-bold text-[10px] text-[#4B5563]">商品 {idx + 1}</div>
                    <div className="font-extrabold text-sm text-[#111827] truncate max-w-[200px]">{displayName}</div>
                    <div className="text-[10px] text-[#4B5563] truncate mt-0.5">{food.servingSizeText}</div>
                  </div>
                  <button
                    onClick={() => onRemoveFromCompare(food)}
                    className="p-1 px-2 text-xs text-[#4B5563] hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                    title="移除此項"
                  >
                    <ShieldX className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            
            {selectedFoods.length < 3 && (
              <div className="flex items-center justify-center p-4 border border-dashed border-[#E5E7EB] bg-[#F9FAFB] rounded-xl text-xs text-[#4B5563] font-bold h-[66px]">
                + 還可以再加入 {3 - selectedFoods.length} 款食物進行對比
              </div>
            )}
          </div>

          {/* Filters & Parameter Toggle Checkboxes */}
          <div className="bg-[#F9FAFB] p-5 rounded-2xl border border-[#E5E7EB]">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#E5E7EB] pb-3.5 mb-4 font-sans">
              <span className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
                <Info className={`w-4 h-4 ${currentTheme.text}`} />
                自訂複選要對比之營養素項目 (複選)：
              </span>

              {/* View mode toggle - perServing or per100g */}
              <div className="flex bg-[#F3F4F6] p-0.5 rounded-lg text-xs border border-[#E5E7EB]">
                <button
                  onClick={() => setCompareMode("perServing")}
                  className={`px-3 py-1 rounded-md transition-all font-bold cursor-pointer ${compareMode === "perServing" ? `${currentTheme.bg} text-white shadow-sm` : "text-[#4B5563] hover:text-[#111827]"}`}
                >
                  以「每份量」對比
                </button>
                <button
                  onClick={() => setCompareMode("per100g")}
                  className={`px-3 py-1 rounded-md transition-all font-bold cursor-pointer ${compareMode === "per100g" ? `${currentTheme.bg} text-white shadow-sm` : "text-[#4B5563] hover:text-[#111827]"}`}
                >
                  以「每100g/ml」對比
                </button>
              </div>
            </div>

            {/* Micro nutrient selectors checkbox matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {(Object.keys(NUTRITION_LABELS) as Array<keyof NutritionValues>).map((key) => {
                const isSelected = selectedKeys.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleKey(key)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left cursor-pointer transition-all border ${
                      isSelected 
                        ? `${currentTheme.bgLight} ${currentTheme.text} font-bold shadow-sm` 
                        : "bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                    }`}
                    style={{ borderColor: isSelected ? currentTheme.primary : undefined }}
                  >
                    {isSelected ? (
                      <CheckSquare className={`w-4 h-4 ${currentTheme.text}`} />
                    ) : (
                      <Square className="w-4 h-4 text-[#4B5563]" />
                    )}
                    <span>{NUTRITION_LABELS[key].label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 text-[10px] text-[#4B5563]">
              * 貼心設定：您選定勾選的項目將會同步反映至下方的視覺化對比圖表與規格數據清單中。
            </div>
          </div>

          {/* Visualized Charts Section */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="font-extrabold text-sm text-[#111827] mb-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentTheme.bg}`} />
              數據柱型趨勢對抗
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#4B5563" fontSize={11} tickLine={false} />
                  <YAxis stroke="#4B5563" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#1F2937" }}
                    itemStyle={{ color: "#1F2937" }}
                    cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "15px", fontSize: "12px", color: "#1F2937" }} />
                  {selectedFoods.map((food, idx) => {
                    const displayName = food.brand ? `${food.brand}-${food.name}` : food.name;
                    return (
                      <Bar 
                        key={food.id} 
                        dataKey={displayName} 
                        fill={colors[idx]} 
                        radius={[4, 4, 0, 0]} 
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exact Comparison Specs Sheet */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="bg-[#F9FAFB] p-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-extrabold text-sm text-[#111827]">
                成分數值詳細對等規格表 (單位)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="p-3 text-[#4B5563] font-bold w-48">對比營養項目</th>
                    {selectedFoods.map((food, idx) => (
                      <th key={food.id} className="p-3 font-extrabold text-[#111827]">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: colors[idx] }}
                          />
                          <span>{food.brand ? `${food.brand} - ` : ""}{food.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {(Object.keys(NUTRITION_LABELS) as Array<keyof NutritionValues>).map((key) => {
                    const labelInfo = NUTRITION_LABELS[key];
                    const isSelected = selectedKeys.includes(key);
                    return (
                      <tr 
                        key={key} 
                        className={`hover:bg-[#F9FAFB] transition-all ${
                          isSelected ? `${currentTheme.bgLight} font-semibold ${currentTheme.text}` : ""
                        }`}
                      >
                        <td className="p-3 text-[#1F2937] pl-4 border-r border-[#E5E7EB]">
                          {labelInfo.label} <span className="text-[10px] text-[#4B5563]">({labelInfo.unit})</span>
                        </td>
                        {selectedFoods.map((food) => {
                          const val = food[compareMode][key];
                          return (
                            <td key={food.id} className={`p-3 font-mono text-[13px] ${isSelected ? currentTheme.text : "text-zinc-800"}`}>
                              {val !== undefined ? Number(val.toFixed(2)).toString() : "0"} {labelInfo.unit}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
