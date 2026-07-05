import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
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
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  clearDeepSeekApiKey,
  getDeepSeekApiKey,
  maskApiKey,
  setDeepSeekApiKey,
} from "@/lib/deepseekConfig";

export default function ApiKeySettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isSavedKeyVisible, setIsSavedKeyVisible] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  const loadData = useCallback(async () => {
    const key = await getDeepSeekApiKey();
    setSavedKey(key);
    setDraftKey("");
    setIsSavedKeyVisible(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const handleSaveApiKey = async () => {
    const trimmed = draftKey.trim();
    if (!trimmed) {
      Alert.alert("请输入 API Key", "密钥不能为空。");
      return;
    }
    if (!trimmed.startsWith("sk-")) {
      Alert.alert("格式可能有误", "DeepSeek API Key 通常以 sk- 开头。");
      return;
    }

    setIsSavingKey(true);
    try {
      await setDeepSeekApiKey(trimmed);
      setSavedKey(trimmed);
      setDraftKey("");
      setIsSavedKeyVisible(false);
      Alert.alert("保存成功", "API Key 已保存。");
    } catch {
      Alert.alert("保存失败", "请稍后重试。");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!savedKey) {
      return;
    }
    await Clipboard.setStringAsync(savedKey);
    Alert.alert("已复制", "API Key 已复制到剪贴板。");
  };

  const handleClearApiKey = () => {
    Alert.alert("清除 API Key", "清除后需要重新配置才能聊天。", [
      { text: "取消", style: "cancel" },
      {
        text: "清除",
        style: "destructive",
        onPress: async () => {
          await clearDeepSeekApiKey();
          setSavedKey(null);
          setDraftKey("");
          setIsSavedKeyVisible(false);
        },
      },
    ]);
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
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <ThemedText type="defaultSemiBold">DeepSeek API Key</ThemedText>
          {savedKey ? (
            <View style={styles.savedKeyRow}>
              <ThemedText
                type="secondary"
                style={styles.savedKeyText}
                numberOfLines={1}
              >
                已配置 {isSavedKeyVisible ? savedKey : maskApiKey(savedKey)}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isSavedKeyVisible ? "隐藏 API Key" : "显示 API Key"}
                hitSlop={8}
                onPress={() => setIsSavedKeyVisible((current) => !current)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={isSavedKeyVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="复制 API Key"
                hitSlop={8}
                onPress={() => void handleCopyApiKey()}
                style={styles.iconButton}
              >
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          ) : (
            <ThemedText type="secondary">
              尚未配置，聊天功能需要先设置 API Key
            </ThemedText>
          )}
          <View
            style={[
              styles.inputWrap,
              { borderColor: theme.border, backgroundColor: theme.background },
            ]}
          >
            <TextInput
              value={draftKey}
              onChangeText={setDraftKey}
              placeholder={savedKey ? "输入新密钥以更新" : "sk-xxxxxxxxxxxxxxxx"}
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!isKeyVisible}
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsKeyVisible((current) => !current)}
              style={styles.eyeButton}
            >
              <ThemedText type="link">{isKeyVisible ? "隐藏" : "显示"}</ThemedText>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={isSavingKey}
            onPress={() => void handleSaveApiKey()}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSavingKey) && styles.pressed,
            ]}
          >
            {isSavingKey ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>保存密钥</ThemedText>
            )}
          </Pressable>
          {savedKey ? (
            <Pressable accessibilityRole="button" onPress={handleClearApiKey}>
              <ThemedText style={styles.clearKeyText}>清除密钥</ThemedText>
            </Pressable>
          ) : null}
          <ExternalLink href="https://platform.deepseek.com/">
            <ThemedText type="link">前往 DeepSeek 平台获取密钥 →</ThemedText>
          </ExternalLink>
        </View>

        <View
          style={[
            styles.helpCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <ThemedText type="defaultSemiBold">如何获取 API Key</ThemedText>
          <ThemedText type="secondary">
            1. 登录 DeepSeek 开放平台{"\n"}
            2. 进入 API Keys 页面{"\n"}
            3. 点击 Create API Key 并复制密钥
          </ThemedText>
        </View>
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
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  savedKeyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  savedKeyText: {
    flex: 1,
    fontSize: 15,
  },
  iconButton: {
    padding: 6,
  },
  helpCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
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
  clearKeyText: {
    color: Colors.red,
    fontSize: 15,
    fontWeight: "600",
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});
