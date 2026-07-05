import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLanguage = "zh" | "en";

const LANGUAGE_STORAGE_KEY = "app_language";

export async function getAppLanguage(): Promise<AppLanguage> {
  const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (value === "zh" || value === "en") {
    return value;
  }
  return "zh";
}

export async function setAppLanguage(language: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
