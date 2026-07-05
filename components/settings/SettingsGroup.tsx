import { type ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type SettingsGroupProps = ViewProps & {
  children: ReactNode;
};

export function SettingsGroup({ children, style, ...rest }: SettingsGroupProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.group,
        { backgroundColor: theme.card, borderColor: theme.border },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
});
