import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'secondary';
};

function getColorKey(
  type: NonNullable<ThemedTextProps['type']>
): 'text' | 'heading' | 'link' | 'textSecondary' {
  if (type === 'link') {
    return 'link';
  }
  if (type === 'secondary') {
    return 'textSecondary';
  }
  if (type === 'title' || type === 'subtitle' || type === 'defaultSemiBold') {
    return 'heading';
  }
  return 'text';
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, getColorKey(type));

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'secondary' ? styles.secondary : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    ...Platform.select({
      ios: { fontWeight: '700' },
      default: { fontWeight: '600' },
    }),
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    ...Platform.select({
      ios: { fontWeight: '700' },
      default: { fontWeight: 'bold' },
    }),
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    ...Platform.select({
      ios: { fontWeight: '700' },
      default: { fontWeight: 'bold' },
    }),
  },
  secondary: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '600',
  },
});
