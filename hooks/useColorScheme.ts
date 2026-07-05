import { useAppearance } from "@/context/AppearanceContext";

export function useColorScheme() {
  return useAppearance().colorScheme;
}
