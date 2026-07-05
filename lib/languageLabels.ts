import type { AppLanguage } from "@/lib/languageConfig";

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  zh: "简体中文",
  en: "English",
};

export const LANGUAGE_OPTIONS: {
  value: AppLanguage;
  label: string;
  icon: "language-outline" | "globe-outline";
}[] = [
  {
    value: "zh",
    label: "简体中文",
    icon: "language-outline",
  },
  {
    value: "en",
    label: "English",
    icon: "globe-outline",
  },
];
