import { useMemo } from "react";
import { View } from "react-native";
import Markdown from "react-native-markdown-display";
import { MessageText, type MessageTextProps } from "react-native-gifted-chat";

import { chatMarkdownContainerStyle, createChatMarkdownStyles } from "@/lib/chatMarkdownStyles";
import { useAppearance } from "@/context/AppearanceContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppChatMessage } from "@/types/chat";

type ChatMarkdownMessageProps = MessageTextProps<AppChatMessage>;

export function ChatMarkdownMessage({
  currentMessage,
  position = "left",
  containerStyle,
}: ChatMarkdownMessageProps) {
  const theme = useAppTheme();
  const { colorScheme } = useAppearance();
  const text = currentMessage?.text?.trim() ?? "";

  const markdownStyles = useMemo(
    () => createChatMarkdownStyles(theme, colorScheme, position),
    [theme, colorScheme, position]
  );

  if (!text) {
    return null;
  }

  return (
    <View style={[chatMarkdownContainerStyle, containerStyle?.[position]]}>
      <Markdown style={markdownStyles}>{text}</Markdown>
    </View>
  );
}

export function ChatMessageText(props: ChatMarkdownMessageProps) {
  const isAssistant = props.currentMessage?.user._id !== 1;

  if (!isAssistant) {
    return <MessageText {...props} />;
  }

  return <ChatMarkdownMessage {...props} />;
}
