/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemeColors {
  id: string;
  name: string;
  emoji: string;
  primary: string;           // hex code, e.g., '#10B981'
  primaryHover: string;      // hex code, e.g., '#059669'
  text: string;              // classes, e.g., 'text-[#10B981]'
  bg: string;                // classes, e.g., 'bg-[#10B981]'
  bgHover: string;           // classes, e.g., 'hover:bg-[#059669]'
  bgLight: string;           // classes, e.g., 'bg-[#10B981]/15'
  bgLightHover: string;      // classes, e.g., 'hover:bg-[#10B981]/15'
  borderLight: string;       // classes, e.g., 'border-[#10B981]/30'
  borderLight35: string;     // classes, e.g., 'border-[#10B981]/35'
  borderLight50: string;     // classes, e.g., 'border-[#10B981]/50'
  focusRing: string;         // classes, e.g., 'focus:ring-[#10B981]'
  shadow: string;            // classes, e.g., 'shadow-emerald-950/25'
  accentColor: string;       // classes, e.g., 'accent-[#10B981]'
  gradientFrom: string;      // classes, e.g., 'from-[#0F5A47]'
  gradientTo: string;        // classes, e.g., 'to-[#0A3D30]'
  textColorOnDark: string;   // classes, e.g., 'text-emerald-100'
  subTextColorOnDark: string;// classes, e.g., 'text-emerald-250'
}

export const THEME_PRESETS: ThemeColors[] = [
  {
    id: "emerald",
    name: "翡翠春綠",
    emoji: "💚",
    primary: "#10B981",
    primaryHover: "#059669",
    text: "text-[#10B981]",
    bg: "bg-[#10B981]",
    bgHover: "hover:bg-[#059669]",
    bgLight: "bg-[#10B981]/15",
    bgLightHover: "hover:bg-[#10B981]/15",
    borderLight: "border-[#10B981]/30",
    borderLight35: "border-[#10B981]/35",
    borderLight50: "border-[#10B981]/50",
    focusRing: "focus:ring-[#10B981]",
    shadow: "shadow-emerald-950/25",
    accentColor: "accent-[#10B981]",
    gradientFrom: "from-[#0F5A47]",
    gradientTo: "to-[#0A3D30]",
    textColorOnDark: "text-emerald-100",
    subTextColorOnDark: "text-emerald-250"
  },
  {
    id: "sapphire",
    name: "曜石深藍",
    emoji: "💙",
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    text: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]",
    bgHover: "hover:bg-[#2563EB]",
    bgLight: "bg-[#3B82F6]/15",
    bgLightHover: "hover:bg-[#3B82F6]/15",
    borderLight: "border-[#3B82F6]/30",
    borderLight35: "border-[#3B82F6]/35",
    borderLight50: "border-[#3B82F6]/50",
    focusRing: "focus:ring-[#3B82F6]",
    shadow: "shadow-blue-950/25",
    accentColor: "accent-[#3B82F6]",
    gradientFrom: "from-[#1E3A8A]",
    gradientTo: "to-[#172554]",
    textColorOnDark: "text-blue-100",
    subTextColorOnDark: "text-blue-250"
  },
  {
    id: "purple",
    name: "極客魅紫",
    emoji: "💜",
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    text: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]",
    bgHover: "hover:bg-[#7C3AED]",
    bgLight: "bg-[#8B5CF6]/15",
    bgLightHover: "hover:bg-[#8B5CF6]/15",
    borderLight: "border-[#8B5CF6]/30",
    borderLight35: "border-[#8B5CF6]/35",
    borderLight50: "border-[#8B5CF6]/50",
    focusRing: "focus:ring-[#8B5CF6]",
    shadow: "shadow-purple-950/25",
    accentColor: "accent-[#8B5CF6]",
    gradientFrom: "from-[#3B0764]",
    gradientTo: "to-[#2E0854]",
    textColorOnDark: "text-purple-100",
    subTextColorOnDark: "text-purple-250"
  },
  {
    id: "amber",
    name: "秋楓暖橙",
    emoji: "🧡",
    primary: "#F59E0B",
    primaryHover: "#D97706",
    text: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]",
    bgHover: "hover:bg-[#D97706]",
    bgLight: "bg-[#F59E0B]/15",
    bgLightHover: "hover:bg-[#F59E0B]/15",
    borderLight: "border-[#F59E0B]/30",
    borderLight35: "border-[#F59E0B]/35",
    borderLight50: "border-[#F59E0B]/50",
    focusRing: "focus:ring-[#F59E0B]",
    shadow: "shadow-amber-950/25",
    accentColor: "accent-[#F59E0B]",
    gradientFrom: "from-[#7C2D12]",
    gradientTo: "to-[#451A03]",
    textColorOnDark: "text-amber-100",
    subTextColorOnDark: "text-amber-250"
  },
  {
    id: "ruby",
    name: "烈海深紅",
    emoji: "❤️",
    primary: "#EF4444",
    primaryHover: "#DC2626",
    text: "text-[#EF4444]",
    bg: "bg-[#EF4444]",
    bgHover: "hover:bg-[#DC2626]",
    bgLight: "bg-[#EF4444]/15",
    bgLightHover: "hover:bg-[#EF4444]/15",
    borderLight: "border-[#EF4444]/30",
    borderLight35: "border-[#EF4444]/35",
    borderLight50: "border-[#EF4444]/50",
    focusRing: "focus:ring-[#EF4444]",
    shadow: "shadow-rose-950/25",
    accentColor: "accent-[#EF4444]",
    gradientFrom: "from-[#701A1A]",
    gradientTo: "to-[#4A0E0E]",
    textColorOnDark: "text-rose-100",
    subTextColorOnDark: "text-rose-250"
  }
];

export const getStoredTheme = (): ThemeColors => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("smartfood_theme_id");
    const matched = THEME_PRESETS.find((t) => t.id === saved);
    if (matched) return matched;
  }
  return THEME_PRESETS[0];
};
