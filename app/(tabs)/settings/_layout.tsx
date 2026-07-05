import { Stack } from "expo-router";

import { renderSettingsStackHeader } from "@/components/settings/SettingsStackHeader";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function SettingsLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        header: renderSettingsStackHeader,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "个人信息" }} />
      <Stack.Screen name="appearance" options={{ title: "外观" }} />
      <Stack.Screen name="language" options={{ title: "语言" }} />
      <Stack.Screen name="account" options={{ title: "账号管理" }} />
      <Stack.Screen name="api-key" options={{ title: "API Key" }} />
      <Stack.Screen name="model" options={{ title: "模型" }} />
      <Stack.Screen name="thinking" options={{ title: "思考模式" }} />
      <Stack.Screen name="usage" options={{ title: "Token 用量" }} />
      <Stack.Screen name="about" options={{ title: "关于" }} />
      <Stack.Screen name="about-app" options={{ title: "关于 DeepSeek Chat" }} />
    </Stack>
  );
}
