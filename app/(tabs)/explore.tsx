import { Colors } from "@/constants/Colors";
import { useDeepSeekApiKey } from "@/hooks/useDeepSeekApiKey";
import { addTokenUsage } from "@/lib/tokenUsageConfig";
import { buildChatApiMessages, streamDeepSeekChat } from "@/lib/deepseekChat";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SystemMessage, GiftedChat } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ChatBubble } from "@/components/chat/ChatBubble";
import {
  FloatingChatComposer,
  useChatListBottomPadding,
} from "@/components/chat/FloatingChatComposer";
import { ThemedText } from "@/components/ThemedText";
import { useChatPreferences } from "@/context/ChatPreferencesContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { AppChatMessage } from "@/types/chat";

const BOT_USER = {
  _id: 2,
  name: "DeepSeek",
  avatar: "https://cdn.deepseek.com/platform/favicon.png",
};

export default function TabTwoScreen() {
  const [messages, setMessages] = useState<AppChatMessage[]>([]);
  const [composerText, setComposerText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMessageIdRef = useRef<string | null>(null);
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const colorScheme = useColorScheme() ?? "light";
  const { apiKey, hasApiKey, isLoading } = useDeepSeekApiKey();
  const { model, thinkingEnabled } = useChatPreferences();
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
          avatar: BOT_USER.avatar,
        },
      },
    ]);
  }, []);

  const updateStreamingMessage = useCallback(
    (messageId: string, patch: Partial<AppChatMessage>) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageId ? { ...message, ...patch } : message
        )
      );
    },
    []
  );

  const sendMessageToDeepSeek = useCallback(
    async (history: AppChatMessage[]) => {
      if (!apiKey) {
        return;
      }

      const messageId = Math.random().toString(36).substring(7);
      streamingMessageIdRef.current = messageId;

      const placeholder: AppChatMessage = {
        _id: messageId,
        text: "",
        createdAt: new Date(),
        user: BOT_USER,
      };

      setMessages((prevMessages) => GiftedChat.append(prevMessages, [placeholder]));
      setIsStreaming(true);

      let content = "";
      let reasoningContent = "";

      await streamDeepSeekChat({
        apiKey,
        model,
        messages: buildChatApiMessages(history),
        thinkingEnabled,
        onDelta: (delta) => {
          if (delta.content) {
            content += delta.content;
          }
          if (delta.reasoningContent) {
            reasoningContent += delta.reasoningContent;
          }
          updateStreamingMessage(messageId, {
            text: content,
            reasoningContent: reasoningContent || undefined,
          });
        },
        onComplete: (usage) => {
          streamingMessageIdRef.current = null;
          setIsStreaming(false);

          if (!content.trim() && !reasoningContent.trim()) {
            updateStreamingMessage(messageId, {
              text: "（无回复内容）",
            });
          }

          if (usage) {
            void addTokenUsage(usage);
          }
        },
        onError: () => {
          streamingMessageIdRef.current = null;
          setIsStreaming(false);
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message._id !== messageId)
          );
          const errorMessage: AppChatMessage = {
            _id: Math.random().toString(36).substring(7),
            system: true,
            text: "请求失败，请检查 API Key、模型或账户余额后重试。",
            createdAt: new Date(),
            user: { _id: 0, name: "System" },
          };
          setMessages((prevMessages) =>
            GiftedChat.append(prevMessages, [errorMessage])
          );
        },
      });
    },
    [apiKey, model, thinkingEnabled, updateStreamingMessage]
  );

  const onSend = useCallback(
    (newMessages: AppChatMessage[] = []) => {
      if (!hasApiKey) {
        router.push("/(tabs)/settings/api-key");
        return;
      }
      if (isStreaming) {
        return;
      }

      setMessages((prevMessages) => {
        const nextMessages = GiftedChat.append(prevMessages, newMessages);
        void sendMessageToDeepSeek(nextMessages);
        return nextMessages;
      });
    },
    [hasApiKey, isStreaming, sendMessageToDeepSeek]
  );

  const handleComposerSend = useCallback(() => {
    const trimmed = composerText.trim();
    if (!trimmed || isStreaming) {
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
  }, [composerText, isStreaming, onSend]);

  const renderBubble = useCallback(
    (props: React.ComponentProps<typeof ChatBubble>) => (
      <ChatBubble {...props} colorScheme={colorScheme} />
    ),
    [colorScheme]
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
          isTyping={isStreaming}
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
          disabled={isStreaming}
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
