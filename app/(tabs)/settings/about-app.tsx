import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getAppVersion } from "@/lib/appVersion";

const APP_VERSION = getAppVersion();

export default function AboutAppScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.hero,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.logo}>
          <ThemedText style={styles.logoText}>DS</ThemedText>
        </View>
        <ThemedText type="title" style={styles.appName}>
          DeepSeek Chat
        </ThemedText>
        <ThemedText type="secondary">Version {APP_VERSION}</ThemedText>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <ThemedText type="defaultSemiBold">应用简介</ThemedText>
        <ThemedText type="secondary" style={styles.paragraph}>
          DeepSeek Chat 是一款基于 React Native（Expo）构建的 AI 对话应用，
          接入 DeepSeek Chat API，支持 iOS、Android 与 Web 多端使用。
        </ThemedText>
        <ThemedText type="secondary" style={styles.paragraph}>
          你的 API Key 与个人设置均保存在本机，不会上传至第三方服务器。
        </ThemedText>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <ThemedText type="defaultSemiBold">相关链接</ThemedText>
        <ExternalLink href="https://platform.deepseek.com/">
          <ThemedText type="link">DeepSeek 开放平台 →</ThemedText>
        </ExternalLink>
        <ExternalLink href="https://github.com/liuyidi/deepseek-react-native">
          <ThemedText type="link">GitHub 开源仓库 →</ThemedText>
        </ExternalLink>
      </View>
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
  hero: {
    alignItems: "center",
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  appName: {
    fontSize: 24,
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  paragraph: {
    lineHeight: 22,
  },
});
