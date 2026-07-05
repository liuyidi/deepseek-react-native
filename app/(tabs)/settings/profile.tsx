import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  DEFAULT_PROFILE,
  getProfileInitial,
  getUserProfile,
  setUserProfile,
  type UserProfile,
} from "@/lib/userProfileConfig";

const AVATAR_COLORS = ["#1063FD", "#34C759", "#FF9500", "#AF52DE", "#FF3B30"];

export default function ProfileSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void getUserProfile().then(setProfile);
    }, [])
  );

  const handleSave = async () => {
    const nickname = profile.nickname.trim();
    if (!nickname) {
      Alert.alert("请输入昵称", "昵称不能为空。");
      return;
    }

    setIsSaving(true);
    try {
      const nextProfile = {
        ...profile,
        nickname,
        bio: profile.bio.trim(),
      };
      await setUserProfile(nextProfile);
      setProfile(nextProfile);
      Alert.alert("保存成功", "个人信息已更新。");
    } catch {
      Alert.alert("保存失败", "请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
            <ThemedText style={styles.avatarText}>
              {getProfileInitial(profile.nickname)}
            </ThemedText>
          </View>
          <ThemedText type="secondary">选择头像颜色</ThemedText>
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map((color) => {
              const selected = profile.avatarColor === color;
              return (
                <Pressable
                  key={color}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setProfile((current) => ({ ...current, avatarColor: color }))}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selected && styles.colorDotSelected,
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.fieldCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <ThemedText type="defaultSemiBold">昵称</ThemedText>
          <TextInput
            value={profile.nickname}
            onChangeText={(nickname) => setProfile((current) => ({ ...current, nickname }))}
            placeholder="输入昵称"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />
        </View>

        <View
          style={[
            styles.fieldCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <ThemedText type="defaultSemiBold">个人描述</ThemedText>
          <TextInput
            value={profile.bio}
            onChangeText={(bio) => setProfile((current) => ({ ...current, bio }))}
            placeholder="介绍一下自己"
            placeholderTextColor={theme.textSecondary}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              { color: theme.text, borderColor: theme.border },
            ]}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.saveButton,
            (pressed || isSaving) && styles.pressed,
          ]}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? "保存中..." : "保存"}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  avatarSection: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fieldCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
