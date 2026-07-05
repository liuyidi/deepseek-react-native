import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useChatPreferences } from "@/context/ChatPreferencesContext";
import { useAppTheme } from "@/hooks/useAppTheme";

const THINKING_OPTIONS = [
  { value: false, label: "关闭", icon: "flash-outline" as const },
  { value: true, label: "开启", icon: "bulb-outline" as const },
];

export default function ThinkingSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { thinkingEnabled, setThinkingEnabled, model } = useChatPreferences();
  const isReasonerModel = model === "deepseek-reasoner";

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="secondary" style={styles.hint}>
        开启后，模型会先输出思考过程，再给出最终回答。V4 模型默认开启思考，此处关闭后将不再展示思考过程。Reasoner
        模型始终开启思考模式。
      </ThemedText>

      {isReasonerModel ? (
        <View
          style={[
            styles.notice,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <ThemedText type="secondary">
            当前模型为 DeepSeek Reasoner，思考模式始终开启。
          </ThemedText>
        </View>
      ) : null}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {THINKING_OPTIONS.map((option, index) => {
          const isSelected = thinkingEnabled === option.value;
          const isLast = index === THINKING_OPTIONS.length - 1;
          const isDisabled = isReasonerModel && !option.value;

          return (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => void setThinkingEnabled(option.value)}
              style={({ pressed }) => [
                styles.optionRow,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
                (pressed || isDisabled) && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: theme.background },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? Colors.primary : theme.textSecondary}
                />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.optionLabel}>
                {option.label}
              </ThemedText>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              ) : (
                <View
                  style={[styles.radioOuter, { borderColor: theme.border }]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  hint: {
    lineHeight: 22,
  },
  notice: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.72,
  },
});
