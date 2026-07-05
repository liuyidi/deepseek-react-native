import * as SecureStore from "expo-secure-store";

export const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const API_KEY_STORAGE_KEY = "deepseek_api_key";

export async function getDeepSeekApiKey(): Promise<string | null> {
  const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  return key?.trim() || null;
}

export async function setDeepSeekApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    return;
  }
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, trimmed);
}

export async function clearDeepSeekApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return "••••••••";
  }
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
