import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardEvent,
} from "react-native";

import { Colors, type ThemeColors } from "@/constants/Colors";

/** 悬浮输入条最小高度 */
export const FLOATING_COMPOSER_HEIGHT = 56;
/** 多行输入时输入框最大高度 */
export const FLOATING_COMPOSER_MAX_HEIGHT = 120;
/** 输入条与 Tab / 键盘之间的间距 */
export const FLOATING_TAB_GAP = 10;
/** 消息列表与悬浮输入框之间的间距 */
export const COMPOSER_LIST_GAP = 12;

/** 悬浮输入条最大占用高度（含 card 内边距） */
const COMPOSER_OVERLAY_HEIGHT =
  FLOATING_COMPOSER_MAX_HEIGHT + 12 + FLOATING_TAB_GAP + COMPOSER_LIST_GAP;

function getListPadding(tabBarHeight: number, keyboardHeight: number): number {
  if (keyboardHeight > 0) {
    return keyboardHeight + COMPOSER_OVERLAY_HEIGHT;
  }
  if (Platform.OS === "ios") {
    return tabBarHeight + COMPOSER_OVERLAY_HEIGHT;
  }
  return COMPOSER_OVERLAY_HEIGHT;
}

function getComposerBottomOffset(tabBarHeight: number, keyboardHeight: number): number {
  const idleBottomOffset =
    Platform.OS === "ios" ? tabBarHeight + FLOATING_TAB_GAP : FLOATING_TAB_GAP;
  return keyboardHeight > 0 ? keyboardHeight + FLOATING_TAB_GAP : idleBottomOffset;
}

function getScrollToBottomButtonBottom(tabBarHeight: number, keyboardHeight: number): number {
  return getComposerBottomOffset(tabBarHeight, keyboardHeight) + FLOATING_COMPOSER_HEIGHT + 8;
}

function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}

type FloatingChatComposerProps = {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  theme: ThemeColors;
  colorScheme: "light" | "dark";
  maxLength?: number;
  disabled?: boolean;
};

export function FloatingChatComposer({
  text,
  onChangeText,
  onSend,
  theme,
  colorScheme,
  maxLength = 1000,
  disabled = false,
}: FloatingChatComposerProps) {
  const tabBarHeight = useBottomTabBarHeight();
  const keyboardHeight = useKeyboardHeight();
  const [inputContentHeight, setInputContentHeight] = useState(22);
  const hasText = Boolean(text.trim()) && !disabled;
  const composerBorder = colorScheme === "dark" ? "#48484A" : "#E4E4E7";
  const isSingleLineInput = inputContentHeight <= 24;

  useEffect(() => {
    if (!text) {
      setInputContentHeight(22);
    }
  }, [text]);

  const bottomOffset = getComposerBottomOffset(tabBarHeight, keyboardHeight);

  const handleSend = useCallback(() => {
    if (hasText) {
      onSend();
    }
  }, [hasText, onSend]);

  return (
    <View
      style={[styles.container, { bottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.card,
          isSingleLineInput ? styles.cardSingleLine : styles.cardMultiLine,
          colorScheme === "dark" ? styles.shadowDark : styles.shadowLight,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={onChangeText}
          editable={!disabled}
          placeholder={disabled ? "DeepSeek 正在回复…" : "给 DeepSeek 发送消息"}
          placeholderTextColor={theme.textSecondary}
          keyboardAppearance={colorScheme === "dark" ? "dark" : "light"}
          selectionColor={Colors.primary}
          multiline
          maxLength={maxLength}
          scrollEnabled={!isSingleLineInput}
          onContentSizeChange={(event) => {
            setInputContentHeight(event.nativeEvent.contentSize.height);
          }}
          style={[
            styles.input,
            { color: theme.text },
            Platform.OS === "ios" ? styles.inputIos : undefined,
            Platform.OS === "ios" && isSingleLineInput ? styles.inputIosSingleLine : undefined,
          ]}
        />
        <View style={styles.sendContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="发送"
            accessibilityState={{ disabled: !hasText }}
            disabled={!hasText}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: hasText ? Colors.primary : composerBorder },
              pressed && hasText ? styles.sendButtonPressed : undefined,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={hasText ? "#FFFFFF" : theme.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** 聊天页布局：列表留白 + 回到底部按钮 bottom */
export function useChatComposerLayout(tabBarHeight: number) {
  const keyboardHeight = useKeyboardHeight();

  return {
    listBottomPadding: { paddingTop: getListPadding(tabBarHeight, keyboardHeight) },
    scrollToBottomBottom: getScrollToBottomButtonBottom(tabBarHeight, keyboardHeight),
  };
}

/** @deprecated 使用 useChatComposerLayout */
export function useChatListBottomPadding(tabBarHeight: number) {
  const { listBottomPadding } = useChatComposerLayout(tabBarHeight);
  return listBottomPadding;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  card: {
    flexDirection: "row",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: FLOATING_COMPOSER_HEIGHT,
    paddingHorizontal: 8,
    gap: 6,
  },
  cardSingleLine: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cardMultiLine: {
    alignItems: "flex-end",
    paddingVertical: 6,
  },
  shadowLight: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }),
  shadowDark: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),
  input: {
    flex: 1,
    marginLeft: 10,
    marginRight: 4,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: FLOATING_COMPOSER_MAX_HEIGHT,
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  inputIos: {
    fontWeight: "400",
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputIosSingleLine: {
    lineHeight: 20,
  },
  sendContainer: {
    justifyContent: "center",
    marginRight: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonPressed: {
    opacity: 0.88,
  },
});
