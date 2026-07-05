import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Bubble, type BubbleProps } from "react-native-gifted-chat";

import { ThemedText } from "@/components/ThemedText";
import type { AppChatMessage } from "@/types/chat";
import { useAppTheme } from "@/hooks/useAppTheme";

type ChatBubbleProps = BubbleProps<AppChatMessage> & {
  colorScheme: "light" | "dark";
  isStreaming?: boolean;
};

export function ChatBubble(props: ChatBubbleProps) {
  const theme = useAppTheme();
  const { colorScheme, currentMessage, isStreaming = false } = props;
  const reasoningContent = currentMessage?.reasoningContent?.trim();
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const isAssistant = currentMessage?.user._id !== 1;
  const isPendingReply =
    isAssistant &&
    Boolean(currentMessage?.isPending) &&
    isStreaming;

  return (
    <View style={styles.wrap}>
      {isAssistant && reasoningContent ? (
        <View
          style={[
            styles.reasoningCard,
            {
              backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#F4F4F5",
              borderColor: theme.border,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isReasoningExpanded }}
            onPress={() => setIsReasoningExpanded((expanded) => !expanded)}
            style={styles.reasoningHeader}
          >
            <ThemedText type="defaultSemiBold" style={styles.reasoningTitle}>
              思考过程
            </ThemedText>
            <ThemedText type="secondary" style={styles.reasoningToggle}>
              {isReasoningExpanded ? "收起" : "展开"}
            </ThemedText>
          </Pressable>
          {isReasoningExpanded ? (
            <ThemedText type="secondary" style={styles.reasoningText}>
              {reasoningContent}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
      <Bubble
        {...props}
        currentMessage={
          isPendingReply
            ? { ...currentMessage!, text: "正在回复…" }
            : currentMessage
        }
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  reasoningCard: {
    marginLeft: 8,
    marginRight: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  reasoningHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  reasoningTitle: {
    fontSize: 13,
  },
  reasoningToggle: {
    fontSize: 13,
  },
  reasoningText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
