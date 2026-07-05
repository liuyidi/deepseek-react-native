import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Colors, type ThemeColors } from "@/constants/Colors";

/** 悬浮输入条本体高度（含内边距，不含 Tab 间距） */
export const FLOATING_COMPOSER_HEIGHT = 56;
/** 输入条与 Tab / 键盘之间的间距 */
export const FLOATING_TAB_GAP = 10;

const COMPOSER_STACK =
  FLOATING_COMPOSER_HEIGHT + FLOATING_TAB_GAP + 12;

function getIdleListPadding(tabBarHeight: number): number {
  if (Platform.OS === "ios") {
    return tabBarHeight + COMPOSER_STACK;
  }
  return COMPOSER_STACK;
}

type FloatingChatComposerProps = {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  theme: ThemeColors;
  colorScheme: "light" | "dark";
  maxLength?: number;
};

export function FloatingChatComposer({
  text,
  onChangeText,
  onSend,
  theme,
  colorScheme,
  maxLength = 1000,
}: FloatingChatComposerProps) {
  const tabBarHeight = useBottomTabBarHeight();
  const keyboard = useAnimatedKeyboard();
  const hasText = Boolean(text.trim());
  const composerBorder = colorScheme === "dark" ? "#48484A" : "#E4E4E7";

  const containerStyle = useAnimatedStyle(() => ({
    bottom:
      keyboard.height.value > 0
        ? keyboard.height.value + FLOATING_TAB_GAP
        : tabBarHeight + FLOATING_TAB_GAP,
  }));

  const handleSend = useCallback(() => {
    if (hasText) {
      onSend();
    }
  }, [hasText, onSend]);

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.card,
          colorScheme === "dark" ? styles.shadowDark : styles.shadowLight,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="给 DeepSeek 发送消息"
          placeholderTextColor={theme.textSecondary}
          keyboardAppearance={colorScheme === "dark" ? "dark" : "light"}
          selectionColor={Colors.primary}
          multiline
          maxLength={maxLength}
          style={[
            styles.input,
            { color: theme.text },
            Platform.OS === "ios" ? styles.inputIos : undefined,
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
    </Animated.View>
  );
}

/** 消息列表底部留白，随键盘高度同步更新 */
export function useChatListBottomPadding(tabBarHeight: number) {
  const keyboard = useAnimatedKeyboard();
  const idlePadding = getIdleListPadding(tabBarHeight);

  const [paddingBottom, setPaddingBottom] = useState(idlePadding);

  useEffect(() => {
    setPaddingBottom(idlePadding);
  }, [idlePadding]);

  useAnimatedReaction(
    () => keyboard.height.value,
    (height) => {
      const next =
        height > 0
          ? height + COMPOSER_STACK
          : idlePadding;
      runOnJS(setPaddingBottom)(next);
    },
    [idlePadding]
  );

  return { paddingBottom };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: FLOATING_COMPOSER_HEIGHT,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
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
    marginTop: Platform.select({ ios: 10, default: 8 }),
    marginBottom: Platform.select({ ios: 10, default: 8 }),
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    backgroundColor: "transparent",
  },
  inputIos: {
    fontWeight: "400",
  },
  sendContainer: {
    justifyContent: "flex-end",
    marginRight: 4,
    marginBottom: 6,
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
