import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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

import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import {
  clearDeepSeekApiKey,
  getDeepSeekApiKey,
  maskApiKey,
  setDeepSeekApiKey,
} from "@/lib/deepseekConfig";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const loadSavedKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const key = await getDeepSeekApiKey();
      setSavedKey(key);
      setDraftKey("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedKey();
    }, [loadSavedKey])
  );

  const handleSave = async () => {
    const trimmed = draftKey.trim();
    if (!trimmed) {
      Alert.alert("请输入 API Key", "密钥不能为空。如需清除，请使用「清除密钥」。");
      return;
    }
    if (!trimmed.startsWith("sk-")) {
      Alert.alert("格式可能有误", "DeepSeek API Key 通常以 sk- 开头，请确认后再保存。");
      return;
    }

    setIsSaving(true);
    try {
      await setDeepSeekApiKey(trimmed);
      setSavedKey(trimmed);
      setDraftKey("");
      Alert.alert("保存成功", "API Key 已安全保存，可以开始聊天了。");
    } catch {
      Alert.alert("保存失败", "请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert("清除 API Key", "清除后需要重新配置才能使用聊天功能。", [
      { text: "取消", style: "cancel" },
      {
        text: "清除",
        style: "destructive",
        onPress: async () => {
          await clearDeepSeekApiKey();
          setSavedKey(null);
          setDraftKey("");
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            设置
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            在此配置 DeepSeek API Key，密钥仅保存在本机。
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold">当前状态</ThemedText>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : savedKey ? (
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <ThemedText style={styles.statusText}>
                已配置 {maskApiKey(savedKey)}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.red} />
              <ThemedText style={styles.statusText}>尚未配置 API Key</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold">API Key</ThemedText>
          <ThemedText style={styles.helpText}>
            在 DeepSeek 平台创建密钥后粘贴到下方。保存后不会显示完整内容。
          </ThemedText>
          <View style={styles.inputWrap}>
            <TextInput
              value={draftKey}
              onChangeText={setDraftKey}
              placeholder={savedKey ? "输入新密钥以更新" : "sk-xxxxxxxxxxxxxxxx"}
              placeholderTextColor={Colors.gray}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!isVisible}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsVisible((current) => !current)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={isVisible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.gray}
              />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => void handleSave()}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSaving) && styles.buttonPressed,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>保存密钥</ThemedText>
            )}
          </Pressable>

          {savedKey ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleClear}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.secondaryButtonText}>清除密钥</ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold">如何获取 API Key</ThemedText>
          <ThemedText style={styles.helpText}>
            1. 登录 DeepSeek 开放平台{"\n"}
            2. 进入 API Keys 页面{"\n"}
            3. 点击 Create API Key 并复制密钥
          </ThemedText>
          <ExternalLink href="https://platform.deepseek.com/">
            <ThemedText type="link">打开 DeepSeek 平台 →</ThemedText>
          </ExternalLink>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    color: Colors.gray,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  loader: {
    alignSelf: "flex-start",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    color: Colors.gray,
    flex: 1,
  },
  helpText: {
    color: Colors.gray,
    lineHeight: 22,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 14,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    color: Colors.muted,
  },
  eyeButton: {
    padding: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  secondaryButtonText: {
    color: Colors.red,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
