import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  ChatPreferenceDropdown,
  type ChatDropdownOption,
} from "@/components/chat/ChatPreferenceDropdown";
import { useChatPreferences } from "@/context/ChatPreferencesContext";
import { MODEL_LABELS, MODEL_OPTIONS } from "@/lib/modelLabels";
import type { DeepSeekModelId } from "@/lib/chatPreferencesConfig";

const THINKING_OPTIONS: ChatDropdownOption<boolean>[] = [
  { value: false, label: "关闭", icon: "flash-outline" },
  { value: true, label: "开启", icon: "bulb-outline" },
];

export function ChatPreferencesBar() {
  const {
    model,
    setModel,
    thinkingEnabled,
    setThinkingEnabled,
    isThinkingActive,
  } = useChatPreferences();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isReasonerModel = model === "deepseek-reasoner";

  const thinkingOptions = useMemo(
    () =>
      THINKING_OPTIONS.map((option) => ({
        ...option,
        disabled: isReasonerModel && !option.value,
      })),
    [isReasonerModel]
  );

  return (
    <View style={styles.row}>
      <ChatPreferenceDropdown<DeepSeekModelId>
        menuId="model"
        activeMenuId={activeMenuId}
        onMenuChange={setActiveMenuId}
        icon="cube-outline"
        activeIcon="cube"
        label={MODEL_LABELS[model]}
        options={MODEL_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          icon: option.icon,
        }))}
        selected={model}
        onSelect={setModel}
      />

      <ChatPreferenceDropdown<boolean>
        menuId="thinking"
        activeMenuId={activeMenuId}
        onMenuChange={setActiveMenuId}
        icon={isThinkingActive ? "bulb" : "bulb-outline"}
        activeIcon="bulb"
        label={`思考 ${isThinkingActive ? "开" : "关"}`}
        options={thinkingOptions}
        selected={isReasonerModel ? true : thinkingEnabled}
        onSelect={setThinkingEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
});
