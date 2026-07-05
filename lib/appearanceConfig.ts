import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppearanceMode = "system" | "light" | "dark";

const APPEARANCE_STORAGE_KEY = "appearance_mode";

export async function getAppearanceMode(): Promise<AppearanceMode> {
  const value = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}

export async function setAppearanceMode(mode: AppearanceMode): Promise<void> {
  await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
}
