import type { AppearanceMode } from "@/lib/appearanceConfig";

export const APPEARANCE_LABELS: Record<AppearanceMode, string> = {
  system: "系统",
  light: "浅色",
  dark: "深色",
};

export const APPEARANCE_OPTIONS: {
  value: AppearanceMode;
  label: string;
  description: string;
  icon: "phone-portrait-outline" | "sunny-outline" | "moon-outline";
}[] = [
  {
    value: "system",
    label: "系统",
    description: "跟随系统深浅色设置",
    icon: "phone-portrait-outline",
  },
  {
    value: "light",
    label: "浅色",
    description: "始终使用浅色界面",
    icon: "sunny-outline",
  },
  {
    value: "dark",
    label: "深色",
    description: "始终使用深色界面",
    icon: "moon-outline",
  },
];
