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
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  SystemMessage,
  IMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";

export default function TabTwoScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const insets = useSafeAreaInsets();
  const { apiKey, hasApiKey, isLoading } = useDeepSeekApiKey();

  useEffect(() => {
    setMessages([
      {
        _id: 0,
        system: true,
        text: "Type your question or share what’s on your mind…",
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
        router.push("/(tabs)/settings");
        return;
      }
      setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
      sendMessageToDeepSeek(newMessages[0]?.text ?? "");
    },
    [hasApiKey, apiKey]
  );

  const renderInputToolbar = useCallback(
    (props: React.ComponentProps<typeof InputToolbar>) => (
      <InputToolbar
        {...props}
        containerStyle={{ backgroundColor: Colors.background }}
      />
    ),
    []
  );

  const renderBubble = useCallback(
    (props: React.ComponentProps<typeof Bubble>) => (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: "#dbffcb" },
          left: { backgroundColor: "#ffffff" },
        }}
      />
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!hasApiKey) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.emptyCard}>
          <Ionicons name="key-outline" size={40} color={Colors.primary} />
          <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
            尚未配置 API Key
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            请先在设置页保存 DeepSeek API Key，再开始聊天。
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/settings")}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.buttonPressed]}
          >
            <ThemedText style={styles.settingsButtonText}>前往设置</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/chat-bg.png")}
      resizeMode="cover"
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        marginBottom: 90,
        marginTop: insets.top,
      }}
    >
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        maxInputLength={1000}
        textInputProps={{ maxLength: 1000 }}
        renderSystemMessage={(props) => (
          <SystemMessage {...props} textStyle={{ color: Colors.gray }} />
        )}
        bottomOffset={insets.bottom}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={(props) => (
          <Send {...props}>
            <Ionicons name="send" color={Colors.primary} size={28} />
          </Send>
        )}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  emptyTitle: {
    fontSize: 20,
  },
  emptyText: {
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
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
