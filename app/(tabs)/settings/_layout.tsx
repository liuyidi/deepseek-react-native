import { Stack } from "expo-router";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function SettingsLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "返回",
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "个人信息" }} />
      <Stack.Screen name="appearance" options={{ title: "外观" }} />
      <Stack.Screen name="language" options={{ title: "语言" }} />
      <Stack.Screen name="account" options={{ title: "账号管理" }} />
      <Stack.Screen name="api-key" options={{ title: "API Key" }} />
      <Stack.Screen name="usage" options={{ title: "Token 用量" }} />
      <Stack.Screen name="about" options={{ title: "关于" }} />
      <Stack.Screen name="about-app" options={{ title: "关于 DeepSeek Chat" }} />
    </Stack>
  );
}
