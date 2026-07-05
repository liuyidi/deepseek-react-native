import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LANGUAGE_OPTIONS } from "@/lib/languageLabels";

export default function LanguageSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {LANGUAGE_OPTIONS.map((option, index) => {
          const isSelected = language === option.value;
          const isLast = index === LANGUAGE_OPTIONS.length - 1;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => void setLanguage(option.value)}
              style={({ pressed }) => [
                styles.optionRow,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
                pressed && styles.pressed,
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
