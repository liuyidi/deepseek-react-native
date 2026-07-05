import type { DeepSeekModelId } from "@/lib/chatPreferencesConfig";

export const MODEL_LABELS: Record<DeepSeekModelId, string> = {
  "deepseek-v4-flash": "V4 Flash",
  "deepseek-v4-pro": "V4 Pro",
  "deepseek-chat": "Chat",
  "deepseek-reasoner": "Reasoner",
};

export const MODEL_OPTIONS: {
  value: DeepSeekModelId;
  label: string;
  icon: "flash-outline" | "diamond-outline" | "chatbubble-outline" | "bulb-outline";
}[] = [
  {
    value: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    icon: "flash-outline",
  },
  {
    value: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    icon: "diamond-outline",
  },
  {
    value: "deepseek-chat",
    label: "DeepSeek Chat（兼容）",
    icon: "chatbubble-outline",
  },
  {
    value: "deepseek-reasoner",
    label: "DeepSeek Reasoner（兼容）",
    icon: "bulb-outline",
  },
];
