import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsNavRow } from "@/components/settings/SettingsNavRow";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useChatPreferences } from "@/context/ChatPreferencesContext";
import { useAppearance } from "@/context/AppearanceContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { maskEmail, maskPhone, type AccountInfo, getAccountInfo } from "@/lib/accountConfig";
import { APPEARANCE_LABELS } from "@/lib/appearanceLabels";
import { getAppVersion } from "@/lib/appVersion";
import { LANGUAGE_LABELS } from "@/lib/languageLabels";
import { MODEL_LABELS } from "@/lib/modelLabels";
import { getDeepSeekApiKey, maskApiKey } from "@/lib/deepseekConfig";
import { formatTokenCount, getTokenUsageStats } from "@/lib/tokenUsageConfig";
import {
  getProfileInitial,
  getUserProfile,
  type UserProfile,
} from "@/lib/userProfileConfig";

const APP_VERSION = getAppVersion();

export default function SettingsHubScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { mode: appearanceMode, setMode } = useAppearance();
  const { language } = useLanguage();
  const { model, isThinkingActive } = useChatPreferences();
  const { user: authUser, logout } = useAuth();
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
    Alert.alert("退出登录", "确定退出当前账号？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出登录",
        style: "destructive",
        onPress: () => {
          void logout().then(async () => {
            await setMode("system");
            router.replace("/(auth)/login");
          });
        },
      },
    ]);
  };

  const profileName = authUser?.nickname ?? profile?.nickname ?? "DeepSeek 用户";
  const profileBio =
    authUser?.bio?.trim() ||
    profile?.bio ||
    authUser?.email ||
    "探索 AI 对话的更多可能";

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
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      stickyHeaderIndices={[0]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top + 16,
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <ThemedText type="title" style={styles.title}>
          我的
        </ThemedText>
      </View>

      <View style={styles.body}>
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
            {profileName}
          </ThemedText>
          <ThemedText type="secondary" numberOfLines={1}>
            {profileBio}
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
          title="模型"
          value={MODEL_LABELS[model]}
          icon="cube-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/model")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsNavRow
          title="思考模式"
          value={isThinkingActive ? "开启" : "关闭"}
          icon="bulb-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/thinking")}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  title: {
    fontSize: 32,
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
