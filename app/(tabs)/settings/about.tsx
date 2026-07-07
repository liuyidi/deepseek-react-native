import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsNavRow } from "@/components/settings/SettingsNavRow";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getAppVersion } from "@/lib/appVersion";

const APP_VERSION = getAppVersion();

export default function AboutSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const handleCheckUpdate = () => {
    Alert.alert("版本更新", `当前已是最新版本 ${APP_VERSION}。`);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <SettingsGroup>
        <SettingsNavRow
          title="版本更新"
          value={`v${APP_VERSION}`}
          icon="cloud-download-outline"
          onPress={handleCheckUpdate}
        />
        <SettingsNavRow
          title="关于 DeepSeek Chat"
          icon="information-circle-outline"
          showDivider={false}
          onPress={() => router.push("/(tabs)/settings/about-app")}
        />
      </SettingsGroup>

      <View style={styles.footer}>
        <ThemedText type="secondary">DeepSeek Chat</ThemedText>
        <ThemedText type="secondary">Version {APP_VERSION}</ThemedText>
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
  footer: {
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
});
