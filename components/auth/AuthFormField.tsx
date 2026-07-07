import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";

type AuthFormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words";
  autoCorrect?: boolean;
};

export function AuthFormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  showToggle = false,
  isVisible = false,
  onToggleVisibility,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
}: AuthFormFieldProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputWrap,
          { borderColor: theme.border, backgroundColor: theme.background },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureTextEntry && !isVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={[styles.input, { color: theme.text }]}
        />
        {showToggle && onToggleVisibility ? (
          <Pressable
            accessibilityRole="button"
            onPress={onToggleVisibility}
            style={styles.toggleButton}
          >
            <ThemedText type="link">{isVisible ? "隐藏" : "显示"}</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
  },
  toggleButton: {
    padding: 8,
  },
});
