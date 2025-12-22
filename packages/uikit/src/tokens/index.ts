import { darkColors, lightColors, additionalColors, baseColors } from "./colors";

export { darkColors, lightColors, additionalColors, baseColors };

// SimpleFlow 科技蓝色系 - 阴影配置
export const shadows = {
  level1: "0px 2px 12px -8px rgba(15, 23, 42, 0.1), 0px 1px 1px rgba(15, 23, 42, 0.05)",
  active: "0px 0px 0px 1px #2563EB, 0px 0px 4px 8px rgba(37, 99, 235, 0.4)",
  success: "0px 0px 0px 1px #22C55E, 0px 0px 0px 4px rgba(34, 197, 94, 0.2)",
  warning: "0px 0px 0px 1px #F59E0B, 0px 0px 0px 4px rgba(245, 158, 11, 0.2)",
  danger: "0px 0px 0px 1px #EF4444, 0px 0px 0px 4px rgba(239, 68, 68, 0.2)",
  focus: "0px 0px 0px 1px #6366F1, 0px 0px 0px 4px rgba(99, 102, 241, 0.6)",
  inset: "inset 0px 2px 2px -1px rgba(15, 23, 42, 0.1)",
  inset2: "inset 0px 2px 0px -1px rgba(0, 0, 0, 0.06)",
  tooltip: "0px 0px 2px rgba(0, 0, 0, 0.2), 0px 4px 12px -8px rgba(15, 23, 42, 0.1)",
};

export const tokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  fonts: {
    normal: "'Kanit', sans-serif",
    mono: "SFMono, ui-monospace, monospace",
  },
  space: {
    "0px": "0px",
    "1rem": "1rem",
    "1px": "1px",
    "2px": "2px",
    "6px": "6px",
    "4px": "4px",
    "8px": "8px",
    "12px": "12px",
    "14px": "14px",
    "16px": "16px",
    "20px": "20px",
    "24px": "24px",
    "32px": "32px",
    "48px": "48px",
    "56px": "56px",
    "64px": "64px",
  },
  borderWidths: {
    "0": "0px",
    "1": "1px",
    "2": "2px",
  },
  radii: {
    "0": "0px",
    "8px": "8px",
    "12px": "12px",
    "20px": "20px",
    "32px": "32px",
    small: "4px",
    default: "16px",
    card: "24px",
    circle: "50%",
  },
  fontSizes: {
    "10px": "10px",
    "12px": "12px",
    "16px": "16px",
    "14px": "14px",
    "20px": "20px",
    "40px": "40px",
  },
  shadows,
} as const;

export type Mode = "light" | "dark";
export type Tokens = typeof tokens;
