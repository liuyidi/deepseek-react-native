import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";

type SettingsNavRowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showDivider?: boolean;
  destructive?: boolean;
  onPress?: () => void;
};

export function SettingsNavRow({
  title,
  subtitle,
  value,
  icon,
  showDivider = true,
  destructive = false,
  onPress,
}: SettingsNavRowProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
        pressed && onPress ? styles.pressed : undefined,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
          <Ionicons
            name={icon}
            size={18}
            color={destructive ? "#EF0827" : theme.textSecondary}
          />
        </View>
      ) : null}
      <View style={styles.content}>
        <ThemedText
          type="defaultSemiBold"
          style={destructive ? styles.destructiveText : undefined}
        >
          {title}
        </ThemedText>
        {subtitle ? <ThemedText type="secondary">{subtitle}</ThemedText> : null}
      </View>
      <View style={styles.trailing}>
        {value ? (
          <ThemedText type="secondary" style={styles.value}>
            {value}
          </ThemedText>
        ) : null}
        {onPress ? (
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "42%",
  },
  value: {
    textAlign: "right",
  },
  destructiveText: {
    color: "#EF0827",
  },
  pressed: {
    opacity: 0.72,
  },
});
