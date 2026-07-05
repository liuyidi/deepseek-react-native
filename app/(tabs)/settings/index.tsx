import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsNavRow } from "@/components/settings/SettingsNavRow";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppearance } from "@/context/AppearanceContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { maskEmail, maskPhone, type AccountInfo, getAccountInfo } from "@/lib/accountConfig";
import { APPEARANCE_LABELS } from "@/lib/appearanceLabels";
import { LANGUAGE_LABELS } from "@/lib/languageLabels";
import { getDeepSeekApiKey, maskApiKey } from "@/lib/deepseekConfig";
import { formatTokenCount, getTokenUsageStats } from "@/lib/tokenUsageConfig";
import { logoutUser } from "@/lib/sessionConfig";
import {
  getProfileInitial,
  getUserProfile,
  type UserProfile,
} from "@/lib/userProfileConfig";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsHubScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { mode: appearanceMode, setMode } = useAppearance();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [apiKeySummary, setApiKeySummary] = useState("未配置");
  const [usageSummary, setUsageSummary] = useState("0");

  const loadPreviewData = useCallback(async () => {
    const [nextProfile, nextAccount, apiKey, usageStats] = await Promise.all([
      getUserProfile(),
      getAccountInfo(),
      getDeepSeekApiKey(),
      getTokenUsageStats(),
    ]);
    setProfile(nextProfile);
    setAccount(nextAccount);
    setApiKeySummary(apiKey ? maskApiKey(apiKey) : "未配置");
    setUsageSummary(formatTokenCount(usageStats.totalTokens));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPreviewData();
    }, [loadPreviewData])
  );

  const handleLogout = () => {
    Alert.alert("退出登录", "确定退出并清除本机登录状态？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出登录",
        style: "destructive",
        onPress: () => {
          void logoutUser().then(async () => {
            await setMode("system");
            await loadPreviewData();
            Alert.alert("已退出", "本机登录状态已清除。");
          });
        },
      },
    ]);
  };

  const accountHubValue = account?.phone
    ? maskPhone(account.phone)
    : account?.wechatBound
      ? "微信已绑定"
      : account?.email
        ? maskEmail(account.email)
        : "未绑定";

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="title" style={styles.title}>
        我的
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(tabs)/settings/profile")}
        style={({ pressed }) => [
          styles.profileCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: profile?.avatarColor ?? Colors.primary },
          ]}
        >
          <ThemedText style={styles.avatarText}>
            {getProfileInitial(profile?.nickname ?? "U")}
          </ThemedText>
        </View>
        <View style={styles.profileContent}>
          <ThemedText type="defaultSemiBold" style={styles.profileName}>
            {profile?.nickname ?? "DeepSeek 用户"}
          </ThemedText>
          <ThemedText type="secondary" numberOfLines={1}>
            {profile?.bio ?? "探索 AI 对话的更多可能"}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </Pressable>

      <SettingsGroup>
        <SettingsNavRow
          title="外观"
          value={APPEARANCE_LABELS[appearanceMode]}
          icon="color-palette-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/appearance")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsNavRow
          title="语言"
          value={LANGUAGE_LABELS[language]}
          icon="language-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/language")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsNavRow
          title="账号管理"
          value={accountHubValue}
          icon="person-circle-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/account")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsNavRow
          title="API Key"
          value={apiKeySummary}
          icon="key-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/api-key")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsNavRow
          title="Token 用量"
          value={usageSummary}
          icon="analytics-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/usage")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsNavRow
          title="关于"
          value={`v${APP_VERSION}`}
          icon="information-circle-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/about")}
        />
      </SettingsGroup>

      <View style={styles.logoutWrap}>
        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <ThemedText style={styles.logoutText}>退出登录</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  profileContent: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
  },
  logoutWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutText: {
    color: Colors.red,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.72,
  },
});
