import { Platform, StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import type { MarkdownProps } from "react-native-markdown-display";

import { Colors, type AppColorScheme, type ThemeColors } from "@/constants/Colors";

type MarkdownStyles = NonNullable<MarkdownProps["style"]>;

function fontWeightSemibold(): TextStyle["fontWeight"] {
  return Platform.OS === "ios" ? "600" : "700";
}

export function createChatMarkdownStyles(
  theme: ThemeColors,
  colorScheme: AppColorScheme,
  position: "left" | "right"
): MarkdownStyles {
  const textColor =
    position === "right"
      ? colorScheme === "dark"
        ? "#EBEBF5"
        : "#1C1C1E"
      : theme.text;

  const codeBackground =
    colorScheme === "dark" ? "#2C2C2E" : position === "right" ? "#D6E4FF" : "#F4F4F5";

  const blockquoteBorder = position === "right" ? Colors.primary : theme.border;

  return {
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    heading1: {
      color: textColor,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: fontWeightSemibold(),
      marginTop: 4,
      marginBottom: 8,
    },
    heading2: {
      color: textColor,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: fontWeightSemibold(),
      marginTop: 4,
      marginBottom: 8,
    },
    heading3: {
      color: textColor,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: fontWeightSemibold(),
      marginTop: 4,
      marginBottom: 6,
    },
    heading4: {
      color: textColor,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: fontWeightSemibold(),
      marginTop: 2,
      marginBottom: 4,
    },
    heading5: {
      color: textColor,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: fontWeightSemibold(),
      marginTop: 2,
      marginBottom: 4,
    },
    heading6: {
      color: textColor,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: fontWeightSemibold(),
      marginTop: 2,
      marginBottom: 4,
    },
    strong: {
      fontWeight: fontWeightSemibold(),
    },
    em: {
      fontStyle: "italic",
    },
    link: {
      color: position === "right" ? (colorScheme === "dark" ? "#A8C7FF" : Colors.primary) : theme.link,
    },
    blockquote: {
      backgroundColor: "transparent",
      borderColor: blockquoteBorder,
      borderLeftWidth: 3,
      paddingLeft: 10,
      marginVertical: 6,
    },
    code_inline: {
      backgroundColor: codeBackground,
      color: textColor,
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
      fontSize: 14,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    fence: {
      backgroundColor: codeBackground,
      borderColor: theme.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      padding: 10,
      marginVertical: 6,
    },
    code_block: {
      backgroundColor: codeBackground,
      color: textColor,
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
      fontSize: 14,
      lineHeight: 20,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      marginVertical: 2,
    },
    hr: {
      backgroundColor: theme.border,
      height: StyleSheet.hairlineWidth,
      marginVertical: 10,
    },
  };
}

export const chatMarkdownContainerStyle: ViewStyle = {
  paddingHorizontal: 10,
  paddingVertical: 6,
};
