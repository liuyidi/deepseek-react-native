import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";

export type ChatDropdownOption<T> = {
  value: T;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
};

type ChatPreferenceDropdownProps<T> = {
  menuId: string;
  activeMenuId: string | null;
  onMenuChange: (menuId: string | null) => void;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon?: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  options: ChatDropdownOption<T>[];
  selected: T;
  onSelect: (value: T) => void | Promise<void>;
  triggerStyle?: StyleProp<ViewStyle>;
};

function isSelected<T>(selected: T, value: T): boolean {
  return selected === value;
}

export function ChatPreferenceDropdown<T>({
  menuId,
  activeMenuId,
  onMenuChange,
  icon,
  activeIcon,
  label,
  options,
  selected,
  onSelect,
  triggerStyle,
}: ChatPreferenceDropdownProps<T>) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const isOpen = activeMenuId === menuId;
  const displayIcon = isOpen && activeIcon ? activeIcon : icon;

  const openMenu = useCallback(() => {
    Keyboard.dismiss();
    onMenuChange(isOpen ? null : menuId);
  }, [isOpen, menuId, onMenuChange]);

  const closeMenu = useCallback(() => {
    onMenuChange(null);
  }, [onMenuChange]);

  const handleSelect = useCallback(
    (value: T, disabled?: boolean) => {
      if (disabled) {
        return;
      }
      void Promise.resolve(onSelect(value)).finally(closeMenu);
    },
    [closeMenu, onSelect]
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={openMenu}
        style={({ pressed }) => [
          styles.chip,
          triggerStyle,
          {
            backgroundColor: theme.card,
            borderColor: isOpen ? Colors.primary : theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={displayIcon}
          size={14}
          color={isOpen ? Colors.primary : theme.textSecondary}
        />
        <ThemedText type="defaultSemiBold" style={styles.chipText}>
          {label}
        </ThemedText>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color={theme.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable
            onPress={() => {
              // 阻止点击菜单时关闭
            }}
            style={[
              styles.menu,
              {
                top: insets.top + 48,
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            {options.map((option, index) => {
              const selectedOption = isSelected(selected, option.value);
              const isLast = index === options.length - 1;

              return (
                <Pressable
                  key={String(option.label)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selectedOption,
                    disabled: option.disabled,
                  }}
                  disabled={option.disabled}
                  onPress={() => handleSelect(option.value, option.disabled)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    !isLast && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.border,
                    },
                    (pressed || option.disabled) && styles.pressed,
                  ]}
                >
                  {option.icon ? (
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: theme.background },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={
                          selectedOption ? Colors.primary : theme.textSecondary
                        }
                      />
                    </View>
                  ) : null}
                  <ThemedText
                    type="defaultSemiBold"
                    style={[
                      styles.optionLabel,
                      option.disabled ? { color: theme.textSecondary } : undefined,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {selectedOption ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primary}
                    />
                  ) : (
                    <View
                      style={[styles.radioOuter, { borderColor: theme.border }]}
                    />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.72,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  menu: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
});
