import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsNavRow } from "@/components/settings/SettingsNavRow";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  fetchDeepSeekBalance,
  formatBalanceAmount,
  pickPrimaryBalance,
  type UserBalance,
} from "@/lib/deepseekBalance";
import { getDeepSeekApiKey } from "@/lib/deepseekConfig";
import {
  formatTokenCount,
  getTokenUsageStats,
  resetTokenUsageStats,
  type TokenUsageStats,
} from "@/lib/tokenUsageConfig";

function formatUpdatedAt(iso: string | null): string {
  if (!iso) {
    return "暂无记录";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "暂无记录";
  }
  return date.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TokenUsageSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [stats, setStats] = useState<TokenUsageStats | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [apiKey, usageStats] = await Promise.all([
        getDeepSeekApiKey(),
        getTokenUsageStats(),
      ]);
      setStats(usageStats);
      setHasApiKey(Boolean(apiKey));

      if (!apiKey) {
        setBalance(null);
        setErrorMessage("请先配置 API Key 后查看账户余额。");
        return;
      }

      const nextBalance = await fetchDeepSeekBalance();
      setBalance(nextBalance);
      setErrorMessage(null);
    } catch {
      setErrorMessage("加载失败，请检查网络或 API Key 是否有效。");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const handleResetStats = () => {
    Alert.alert("重置统计", "将清除本机累计的 Token 用量记录，不影响 DeepSeek 账户余额。", [
      { text: "取消", style: "cancel" },
      {
        text: "重置",
        style: "destructive",
        onPress: () => {
          void resetTokenUsageStats().then(async () => {
            const nextStats = await getTokenUsageStats();
            setStats(nextStats);
          });
        },
      },
    ]);
  };

  const primaryBalance = balance ? pickPrimaryBalance(balance.balances) : null;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadData(true)}
          tintColor={Colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          {!hasApiKey ? (
            <View
              style={[
                styles.noticeCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Ionicons name="key-outline" size={28} color={Colors.primary} />
              <ThemedText type="defaultSemiBold">尚未配置 API Key</ThemedText>
              <ThemedText type="secondary" style={styles.noticeText}>
                配置后可查询账户余额，聊天时会自动累计本机 Token 用量。
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(tabs)/settings/api-key")}
                style={({ pressed }) => [
                  styles.noticeButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText style={styles.noticeButtonText}>去配置</ThemedText>
              </Pressable>
            </View>
          ) : null}

          {errorMessage && hasApiKey ? (
            <View
              style={[
                styles.errorCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <ThemedText type="secondary">{errorMessage}</ThemedText>
            </View>
          ) : null}

          {primaryBalance ? (
            <View style={styles.section}>
              <ThemedText type="secondary" style={styles.sectionTitle}>
                账户余额
              </ThemedText>
              <View
                style={[
                  styles.balanceHero,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <ThemedText type="secondary">可用余额</ThemedText>
                <ThemedText type="title" style={styles.balanceAmount}>
                  {formatBalanceAmount(
                    primaryBalance.total_balance,
                    primaryBalance.currency
                  )}
                </ThemedText>
                <ThemedText type="secondary">
                  {balance?.isAvailable ? "余额充足，可正常调用 API" : "余额不足，请及时充值"}
                </ThemedText>
                <View style={styles.balanceBreakdown}>
                  <View style={styles.breakdownItem}>
                    <ThemedText type="secondary">充值余额</ThemedText>
                    <ThemedText type="defaultSemiBold">
                      {formatBalanceAmount(
                        primaryBalance.topped_up_balance,
                        primaryBalance.currency
                      )}
                    </ThemedText>
                  </View>
                  <View style={styles.breakdownItem}>
                    <ThemedText type="secondary">赠送余额</ThemedText>
                    <ThemedText type="defaultSemiBold">
                      {formatBalanceAmount(
                        primaryBalance.granted_balance,
                        primaryBalance.currency
                      )}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="secondary" style={styles.sectionTitle}>
              本机 Token 用量
            </ThemedText>
            <SettingsGroup>
              <SettingsNavRow
                title="累计 Token"
                value={formatTokenCount(stats?.totalTokens ?? 0)}
                icon="analytics-outline"
              />
              <SettingsNavRow
                title="输入 Token"
                value={formatTokenCount(stats?.promptTokens ?? 0)}
                icon="arrow-down-outline"
              />
              <SettingsNavRow
                title="输出 Token"
                value={formatTokenCount(stats?.completionTokens ?? 0)}
                icon="arrow-up-outline"
              />
              <SettingsNavRow
                title="请求次数"
                value={String(stats?.requestCount ?? 0)}
                icon="chatbubbles-outline"
                showDivider={false}
              />
            </SettingsGroup>
            <ThemedText type="secondary" style={styles.hint}>
              统计本 App 内聊天产生的 Token，最后更新：{formatUpdatedAt(stats?.lastUpdatedAt ?? null)}
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleResetStats}
            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
          >
            <ThemedText style={styles.resetText}>重置本机统计</ThemedText>
          </Pressable>
        </>
      )}
    </ScrollView>
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
  loadingWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    marginLeft: 4,
  },
  balanceHero: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 36,
    lineHeight: 42,
  },
  balanceBreakdown: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
  },
  breakdownItem: {
    alignItems: "center",
    gap: 4,
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 4,
  },
  noticeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  noticeText: {
    textAlign: "center",
    lineHeight: 22,
  },
  noticeButton: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  noticeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  resetButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resetText: {
    color: Colors.red,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.72,
  },
});
