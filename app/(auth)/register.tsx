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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { register, isAuthenticated, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isReady && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleRegister = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedNickname = nickname.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      Alert.alert("邮箱格式有误", "请输入有效的邮箱地址。");
      return;
    }
    if (password.length < 8) {
      Alert.alert("密码太短", "密码至少需要 8 个字符。");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("密码不一致", "两次输入的密码不一致。");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: trimmedEmail,
        password,
        nickname: trimmedNickname || undefined,
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("注册失败", error instanceof Error ? error.message : "请稍后重试。");
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
            注册
          </ThemedText>
          <ThemedText type="secondary">
            创建账号后即可登录 DeepSeek Chat，后续可同步会话到云端。
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
            label="昵称（可选）"
            value={nickname}
            onChangeText={setNickname}
            placeholder="DeepSeek 用户"
            autoCapitalize="words"
            autoCorrect={false}
          />
          <AuthFormField
            label="密码"
            value={password}
            onChangeText={setPassword}
            placeholder="至少 8 位"
            secureTextEntry
            showToggle
            isVisible={isPasswordVisible}
            onToggleVisibility={() => setIsPasswordVisible((current) => !current)}
          />
          <AuthFormField
            label="确认密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="再次输入密码"
            secureTextEntry
            showToggle
            isVisible={isPasswordVisible}
            onToggleVisibility={() => setIsPasswordVisible((current) => !current)}
          />

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleRegister()}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSubmitting) && styles.pressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>注册</ThemedText>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="secondary">已有账号？</ThemedText>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link">
              <ThemedText type="link">去登录</ThemedText>
            </Pressable>
          </Link>
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
  pressed: {
    opacity: 0.88,
  },
});
