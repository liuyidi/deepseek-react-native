import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

const FEATURES = [
  {
    icon: "chatbubbles-outline" as const,
    title: "实时对话",
    description: "基于 DeepSeek Chat 模型，流畅问答",
  },
  {
    icon: "flash-outline" as const,
    title: "快速接入",
    description: "只需 API Key，即可开始聊天",
  },
  {
    icon: "phone-portrait-outline" as const,
    title: "多端运行",
    description: "iOS、Android、Web 均可使用",
  },
];

const SETUP_STEPS = [
  {
    step: "01",
    title: "注册 DeepSeek 账号",
    description:
      "访问 platform.deepseek.com，登录或注册账号。",
    externalLink: "https://platform.deepseek.com/",
    linkLabel: "打开 DeepSeek 平台",
  },
  {
    step: "02",
    title: "创建 API Key",
    description:
      "进入「API Keys」页面，点击「Create API Key」，复制生成的密钥。",
  },
  {
    step: "03",
    title: "在设置页保存密钥",
    description:
      "打开底部 Settings 标签页，粘贴 API Key 并保存。密钥仅存储在本机。",
    linkLabel: "前往设置页",
    openSettings: true,
  },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Image
            source={{ uri: "https://cdn.deepseek.com/platform/favicon.png" }}
            style={styles.logo}
          />
          <ThemedText style={styles.heroBadgeText}>DeepSeek</ThemedText>
        </View>
        <ThemedText style={styles.heroTitle}>DeepSeek Chat</ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          在 React Native 中体验 DeepSeek AI 对话能力
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={() => router.push("/(tabs)/explore")}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <ThemedText style={styles.primaryButtonText}>开始聊天</ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          功能亮点
        </ThemedText>
        <View style={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Ionicons
                  name={feature.icon}
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <ThemedText type="defaultSemiBold">{feature.title}</ThemedText>
              <ThemedText style={styles.featureDescription}>
                {feature.description}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          快速上手
        </ThemedText>
        {SETUP_STEPS.map((item) => (
          <View key={item.step} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>{item.step}</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={styles.stepTitle}>
                {item.title}
              </ThemedText>
            </View>
            <ThemedText style={styles.stepDescription}>{item.description}</ThemedText>
            {"externalLink" in item && item.externalLink ? (
              <ExternalLink href={item.externalLink} style={styles.stepLink}>
                <ThemedText type="link">{item.linkLabel}</ThemedText>
              </ExternalLink>
            ) : null}
            {"openSettings" in item && item.openSettings ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(tabs)/settings")}
                style={styles.stepLink}
              >
                <ThemedText type="link">{item.linkLabel}</ThemedText>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.footerCard}>
        <ThemedText type="defaultSemiBold">准备好试试了吗？</ThemedText>
        <ThemedText style={styles.footerText}>
          配置好 API Key 后，切换到 Chat 标签页即可开始对话。
        </ThemedText>
        <Link href="/(tabs)/settings" style={styles.secondaryLink}>
          <ThemedText type="link">前往设置页配置 API Key →</ThemedText>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 28,
  },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  logo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 22,
  },
  featureGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  featureDescription: {
    color: Colors.gray,
    lineHeight: 22,
  },
  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  stepTitle: {
    flex: 1,
    fontSize: 17,
  },
  stepDescription: {
    color: Colors.gray,
    lineHeight: 22,
  },
  stepLink: {
    alignSelf: "flex-start",
  },
  footerCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  footerText: {
    color: Colors.gray,
    lineHeight: 22,
  },
  secondaryLink: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
});
