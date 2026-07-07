import { Colors } from "@/constants/Colors";
import { useDeepSeekApiKey } from "@/hooks/useDeepSeekApiKey";
import { addTokenUsage } from "@/lib/tokenUsageConfig";
import {
  buildChatApiMessages,
  formatChatErrorMessage,
  streamDeepSeekChat,
} from "@/lib/deepseekChat";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  SystemMessage,
  GiftedChat,
  type IMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatPreferencesBar } from "@/components/chat/ChatPreferencesBar";
import {
  FloatingChatComposer,
  useChatComposerLayout,
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
  const { listBottomPadding, scrollToBottomBottom } = useChatComposerLayout(tabBarHeight);

  const renderScrollToBottom = useCallback(
    () => <Ionicons name="chevron-down" size={22} color={theme.text} />,
    [theme.text]
  );

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
          String(message._id) === String(messageId)
            ? { ...message, ...patch }
            : message
        )
      );
    },
    []
  );

  const startBotReply = useCallback(
    async (botMessageId: string, apiMessages: ReturnType<typeof buildChatApiMessages>) => {
      if (!apiKey) {
        return;
      }

      streamingMessageIdRef.current = botMessageId;
      setIsStreaming(true);

      let content = "";
      let reasoningContent = "";

      await streamDeepSeekChat({
        apiKey,
        model,
        messages: apiMessages,
        thinkingEnabled,
        onDelta: (delta) => {
          if (delta.content) {
            content += delta.content;
          }
          if (delta.reasoningContent) {
            reasoningContent += delta.reasoningContent;
          }
          updateStreamingMessage(botMessageId, {
            text: content,
            reasoningContent: reasoningContent || undefined,
            isPending: false,
          });
        },
        onComplete: (usage) => {
          streamingMessageIdRef.current = null;
          setIsStreaming(false);

          if (!content.trim() && !reasoningContent.trim()) {
            updateStreamingMessage(botMessageId, {
              text: "（无回复内容）",
              isPending: false,
            });
          }

          if (usage) {
            void addTokenUsage(usage);
          }
        },
        onError: (error) => {
          streamingMessageIdRef.current = null;
          setIsStreaming(false);
          setMessages((prevMessages) =>
            prevMessages.filter(
              (message) => String(message._id) !== String(botMessageId)
            )
          );
          const errorMessage: AppChatMessage = {
            _id: Math.random().toString(36).substring(7),
            system: true,
            text: formatChatErrorMessage(error),
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

      const botMessageId = Math.random().toString(36).substring(7);
      const placeholder: AppChatMessage = {
        _id: botMessageId,
        text: "",
        isPending: true,
        createdAt: new Date(),
        user: BOT_USER,
      };

      setMessages((prevMessages) => {
        const withUser = GiftedChat.append(prevMessages, newMessages);
        const apiMessages = buildChatApiMessages(withUser);
        void startBotReply(botMessageId, apiMessages);
        return GiftedChat.append(withUser, [placeholder]);
      });
    },
    [hasApiKey, isStreaming, startBotReply]
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
      <ChatBubble {...props} colorScheme={colorScheme} isStreaming={isStreaming} />
    ),
    [colorScheme, isStreaming]
  );

  const shouldUpdateMessage = useCallback(
    (
      current: { currentMessage: IMessage },
      next: { currentMessage: IMessage }
    ) => {
      const currentMessage = current.currentMessage as AppChatMessage;
      const nextMessage = next.currentMessage as AppChatMessage;
      return (
        currentMessage.text !== nextMessage.text ||
        currentMessage.reasoningContent !== nextMessage.reasoningContent ||
        currentMessage.isPending !== nextMessage.isPending
      );
    },
    []
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
        <ChatPreferencesBar />
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: 1 }}
          isTyping={isStreaming}
          isKeyboardInternallyHandled={false}
          scrollToBottom
          scrollToBottomStyle={[
            styles.scrollToBottomButton,
            {
              bottom: scrollToBottomBottom,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            colorScheme === "dark" ? styles.scrollToBottomShadowDark : styles.scrollToBottomShadowLight,
          ]}
          scrollToBottomComponent={renderScrollToBottom}
          renderInputToolbar={() => null}
          shouldUpdateMessage={shouldUpdateMessage}
          listViewProps={{
            contentContainerStyle: listBottomPadding,
            keyboardShouldPersistTaps: "never",
            keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag",
            extraData: messages,
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
  scrollToBottomButton: {
    opacity: 1,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  scrollToBottomShadowLight: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
  scrollToBottomShadowDark: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
    default: {},
  }),
});
