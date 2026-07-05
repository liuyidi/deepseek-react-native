import { Colors } from "@/constants/Colors";
import { useDeepSeekApiKey } from "@/hooks/useDeepSeekApiKey";
import { DEEPSEEK_API_URL } from "@/lib/deepseekConfig";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Bubble,
  SystemMessage,
  IMessage,
  GiftedChat,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import {
  FloatingChatComposer,
  useChatListBottomPadding,
} from "@/components/chat/FloatingChatComposer";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabTwoScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [composerText, setComposerText] = useState("");
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const colorScheme = useColorScheme() ?? "light";
  const { apiKey, hasApiKey, isLoading } = useDeepSeekApiKey();
  const tabBarHeight = useBottomTabBarHeight();
  const listBottomPadding = useChatListBottomPadding(tabBarHeight);

  useEffect(() => {
    setMessages([
      {
        _id: 0,
        system: true,
        text: "输入你的问题，或分享你想聊的话题…",
        createdAt: new Date(),
        user: {
          _id: 0,
          name: "DeepSeek",
          avatar: "https://cdn.deepseek.com/platform/favicon.png",
        },
      },
    ]);
  }, []);

  const sendMessageToDeepSeek = async (userMessage: string) => {
    if (!apiKey) {
      return;
    }

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: "deepseek-chat",
          messages: [{ role: "user", content: userMessage }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botReply = response.data.choices[0].message.content;

      const newBotMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        text: botReply,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "DeepSeek",
          avatar: "https://cdn.deepseek.com/platform/favicon.png",
        },
      };

      setMessages((prevMessages) => GiftedChat.append(prevMessages, [newBotMessage]));
    } catch (error) {
      console.error("DeepSeek API Error:", error);
      const errorMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        system: true,
        text: "请求失败，请检查 API Key 或账户余额后重试。",
        createdAt: new Date(),
        user: { _id: 0, name: "System" },
      };
      setMessages((prevMessages) => GiftedChat.append(prevMessages, [errorMessage]));
    }
  };

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (!hasApiKey) {
        router.push("/(tabs)/settings/api-key");
        return;
      }
      setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
      sendMessageToDeepSeek(newMessages[0]?.text ?? "");
    },
    [hasApiKey, apiKey]
  );

  const handleComposerSend = useCallback(() => {
    const trimmed = composerText.trim();
    if (!trimmed) {
      return;
    }
    onSend([
      {
        _id: Math.random().toString(36).substring(7),
        text: trimmed,
        createdAt: new Date(),
        user: { _id: 1 },
      },
    ]);
    setComposerText("");
  }, [composerText, onSend]);

  const renderBubble = useCallback(
    (props: React.ComponentProps<typeof Bubble>) => (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colorScheme === "dark" ? "#1E3A5F" : "#E8F0FF",
            borderRadius: 18,
          },
          left: {
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.border,
          },
        }}
        textStyle={{
          right: { color: colorScheme === "dark" ? "#EBEBF5" : "#1C1C1E" },
          left: { color: theme.text },
        }}
      />
    ),
    [colorScheme, theme.border, theme.card, theme.text]
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          { paddingTop: insets.top, backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!hasApiKey) {
    return (
      <View
        style={[
          styles.centered,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 100,
            backgroundColor: theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="key-outline" size={40} color={Colors.primary} />
          <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
            尚未配置 API Key
          </ThemedText>
          <ThemedText type="secondary" style={styles.emptyText}>
            请先在「我的」页面配置 DeepSeek API Key，再开始聊天。
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/settings/api-key")}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.buttonPressed]}
          >
            <ThemedText style={styles.settingsButtonText}>配置 API Key</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/chat-bg.png")}
      resizeMode="cover"
      style={[
        styles.chatScreen,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: 1 }}
          isKeyboardInternallyHandled={false}
          renderInputToolbar={() => null}
          listViewProps={{
            contentContainerStyle: listBottomPadding,
            keyboardShouldPersistTaps: "handled",
          }}
          renderSystemMessage={(props) => (
            <SystemMessage {...props} textStyle={{ color: theme.textSecondary }} />
          )}
          renderBubble={renderBubble}
        />
        <FloatingChatComposer
          text={composerText}
          onChangeText={setComposerText}
          onSend={handleComposerSend}
          theme={theme}
          colorScheme={colorScheme}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  chatScreen: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 20,
  },
  emptyText: {
    textAlign: "center",
  },
  settingsButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
