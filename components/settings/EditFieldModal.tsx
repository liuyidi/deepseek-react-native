import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";

type EditFieldModalProps = {
  visible: boolean;
  title: string;
  value: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  onClose: () => void;
  onSave: (value: string) => void;
};

export function EditFieldModal({
  visible,
  title,
  value,
  placeholder,
  keyboardType = "default",
  onClose,
  onSave,
}: EditFieldModalProps) {
  const theme = useAppTheme();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable accessibilityRole="button" style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {title}
          </ThemedText>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            keyboardType={keyboardType}
            autoFocus
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
            ]}
          />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.actionButton}>
              <ThemedText type="secondary">取消</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(draft.trim())}
              style={[styles.actionButton, styles.saveButton]}
            >
              <ThemedText style={styles.saveText}>保存</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 18,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButton: {
    minWidth: 56,
    alignItems: "center",
  },
  saveText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
