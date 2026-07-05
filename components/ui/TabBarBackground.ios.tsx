import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BlurTabBarBackground() {
  const scheme = useColorScheme() ?? 'light';
  const surfaceColor = Colors[scheme].card;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: surfaceColor, opacity: scheme === 'dark' ? 0.98 : 0.96 },
        ]}
      />
      <BlurView
        tint={scheme === 'dark' ? 'dark' : 'light'}
        intensity={scheme === 'dark' ? 40 : 55}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
