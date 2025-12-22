import { darkColorsV2, lightColorsV2 } from "./v2Colors";

// SimpleFlow 科技蓝色系 - 基础色（两个主题共用）
export const baseColors = {
  white: "white",
  failure: "#EF4444", // 红色系错误色
  failure33: "#EF444433",
  primary: "#2563EB", // 科技蓝主色 (原: #1FC7D4 青色)
  primary0f: "#2563EB0f",
  primary3D: "#2563EB3D",
  primaryBright: "#3B82F6", // 蓝色高亮 (原: #53DEE9)
  primaryDark: "#1D4ED8", // 蓝色深色 (原: #0098A1)
  success: "#22C55E", // 绿色成功
  success19: "#22C55E19",
  warning: "#F59E0B", // 橙色警告
  warning2D: "#F59E0B2D",
  warning33: "#F59E0B33",
};

export const additionalColors = {
  binance: "#F0B90B",
  overlay: "#1E3A5F", // 深蓝遮罩色
  gold: "#FFC700",
  silver: "#B2B2B2",
  bronze: "#E7974D",
  yellow: "#D67E0A",
};

// SimpleFlow 科技蓝色系 - 亮色主题
export const lightColors = {
  ...baseColors,
  ...additionalColors,
  ...lightColorsV2,
  blue10: "#EFF6FF",
  blue20: "#DBEAFE",
  blue60: "#2563EB",
  secondary: "#6366F1", // 靛蓝色副色 (原: #7645D9 紫色)
  secondary10: "#EEF2FF",
  secondary20: "#E0E7FF",
  secondary60: "#4F46E5",
  secondary80: "#6366F180",
  background: "#F8FAFC", // 冷灰背景
  backgroundDisabled: "#E2E8F0",
  backgroundAlt: "#FFFFFF",
  backgroundAlt2: "rgba(255, 255, 255, 0.7)",
  backgroundAlt3: "rgba(255, 255, 255, 0.5)",
  backgroundHover: "rgba(0, 0, 0, 0.02)",
  backgroundTapped: "rgba(0, 0, 0, 0.04)",
  backgroundOverlay: "rgba(15, 23, 42, 0.60)",
  backgroundBubblegum: "linear-gradient(139.73deg, #EFF6FF 0%, #F0F9FF 100%)", // 蓝色渐变
  backgroundPage: "#F1F5F9",
  card: "#FFFFFF",
  cardSecondary: "#F8FAFC",
  cardBorder: "#E2E8F0",
  contrast: "#0F172A",
  dropdown: "#F8FAFC",
  dropdownDeep: "#F1F5F9",
  invertedContrast: "#FFFFFF",
  input: "#F1F5F9",
  inputSecondary: "#E2E8F0",
  tertiary: "#F1F5F9",
  tertiary20: "#E2E8F0",
  tertiaryPale20: "#E2E8F0",
  text: "#0F172A", // 深蓝黑文字
  text99: "#0F172A99",
  textDisabled: "#94A3B8",
  textSubtle: "#64748B", // 灰蓝次要文字
  disabled: "#E2E8F0",
  primary10: "#EFF6FF",
  primary20: "#DBEAFE",
  primary60: "#2563EB",
  positive10: "#F0FDF4",
  positive20: "#DCFCE7",
  positive60: "#16A34A",
  destructive10: "#FEF2F2",
  destructive20: "#FECACA",
  destructive60: "#DC2626",
  destructive: "#EF4444",
  warning10: "#FFFBEB",
  warning20: "#FEF3C7",
  warning60: "#D97706",
  bubblegum: "#EFF6FF",
  gradientPrimary: "linear-gradient(228.54deg, #3B82F6 -13.69%, #6366F1 91.33%)",
  gradientBubblegum: "linear-gradient(139.73deg, #EFF6FF 0%, #F0F9FF 100%)",
  gradientInverseBubblegum: "linear-gradient(139.73deg, #F0F9FF 0%, #EFF6FF 100%)",
  gradientCardHeader: "linear-gradient(111.68deg, #F1F5F9 0%, #EFF6FF 100%)",
  gradientBlue: "linear-gradient(180deg, #BFDBFE 0%, #93C5FD 100%)",
  gradientViolet: "linear-gradient(180deg, #DDD6FE 0%, #C4B5FD 100%)",
  gradientVioletAlt: "linear-gradient(180deg, #E0E7FF 0%, #C7D2FE 100%)",
  gradientGold: "linear-gradient(180deg, #FFD800 0%, #FDAB32 100%)",
  gradientBold: "linear-gradient(#3B82F6, #6366F1)",
};

// SimpleFlow 科技蓝色系 - 暗色主题
export const darkColors = {
  ...baseColors,
  ...additionalColors,
  ...darkColorsV2,
  blue10: "#1E3A5F",
  blue20: "#1E40AF",
  blue60: "#60A5FA",
  secondary: "#818CF8", // 亮靛蓝副色
  secondary10: "#1E1B4B",
  secondary20: "#312E81",
  secondary60: "#A5B4FC",
  secondary80: "#818CF880",
  background: "#0F172A", // 深蓝黑背景 (原: #08060B)
  backgroundDisabled: "#334155",
  backgroundAlt: "#1E293B", // 深蓝灰卡片 (原: #27262c)
  backgroundAlt2: "rgba(30, 41, 59, 0.7)",
  backgroundAlt3: "rgba(0, 0, 0, 0.2)",
  backgroundHover: "rgba(255, 255, 255, 0.04)",
  backgroundTapped: "rgba(255, 255, 255, 0.08)",
  backgroundOverlay: "rgba(15, 23, 42, 0.80)",
  backgroundBubblegum: "#0F172A",
  backgroundPage: "#0F172A",
  card: "#1E293B",
  cardSecondary: "#0F172A",
  cardBorder: "#334155",
  contrast: "#F1F5F9",
  dropdown: "#1E293B",
  dropdownDeep: "#0F172A",
  invertedContrast: "#0F172A",
  input: "#334155",
  inputSecondary: "#1E293B",
  primaryDark: "#1D4ED8",
  tertiary: "#334155",
  tertiary20: "#475569",
  tertiaryPale20: "#475569",
  text: "#F1F5F9", // 浅灰白文字
  text99: "#F1F5F999",
  textDisabled: "#64748B",
  textSubtle: "#94A3B8", // 浅蓝灰次要文字
  disabled: "#475569",
  primary10: "#1E3A5F",
  primary20: "#1E40AF",
  primary60: "#60A5FA",
  positive10: "#14532D",
  positive20: "#166534",
  positive60: "#4ADE80",
  destructive10: "#7F1D1D",
  destructive20: "#991B1B",
  destructive60: "#F87171",
  destructive: "#EF4444",
  warning10: "#78350F",
  warning20: "#92400E",
  warning60: "#FBBF24",
  bubblegum: "#0F172A",
  gradientPrimary: "linear-gradient(228.54deg, #3B82F6 -13.69%, #818CF8 91.33%)",
  gradientBubblegum: "linear-gradient(139.73deg, #1E3A5F 0%, #1E293B 100%)",
  gradientInverseBubblegum: "linear-gradient(139.73deg, #1E293B 0%, #1E3A5F 100%)",
  gradientCardHeader: "linear-gradient(166.77deg, #334155 0%, #1E293B 100%)",
  gradientBlue: "linear-gradient(180deg, #1E40AF 0%, #1D4ED8 100%)",
  gradientViolet: "linear-gradient(180deg, #4C1D95 0%, #5B21B6 100%)",
  gradientVioletAlt: "linear-gradient(180deg, #312E81 0%, #4338CA 100%)",
  gradientGold: "linear-gradient(180deg, #FFD800 0%, #FDAB32 100%)",
  gradientBold: "linear-gradient(#60A5FA, #818CF8)",
};
