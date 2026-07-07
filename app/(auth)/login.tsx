import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthFormField } from "@/components/auth/AuthFormField";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { login, enterGuestMode, isAuthenticated, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isReady && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      Alert.alert("邮箱格式有误", "请输入有效的邮箱地址。");
      return;
    }
    if (!password) {
      Alert.alert("请输入密码", "密码不能为空。");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("登录失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            登录
          </ThemedText>
          <ThemedText type="secondary">
            使用 deepseek-chat-api 账号登录，同步你的对话与设置。
          </ThemedText>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <AuthFormField
            label="邮箱"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <AuthFormField
            label="密码"
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            secureTextEntry
            showToggle
            isVisible={isPasswordVisible}
            onToggleVisibility={() => setIsPasswordVisible((current) => !current)}
          />

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleLogin()}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSubmitting) && styles.pressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>登录</ThemedText>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="secondary">还没有账号？</ThemedText>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link">
              <ThemedText type="link">立即注册</ThemedText>
            </Pressable>
          </Link>
        </View>

        {__DEV__ ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              enterGuestMode();
              router.replace("/(tabs)/explore");
            }}
            style={({ pressed }) => [styles.guestButton, pressed && styles.pressed]}
          >
            <ThemedText type="secondary" style={styles.guestButtonText}>
              跳过登录，直接进入 Chat（临时）
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  guestButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  guestButtonText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.88,
  },
});
