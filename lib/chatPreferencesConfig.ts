import AsyncStorage from "@react-native-async-storage/async-storage";

export type DeepSeekModelId =
  | "deepseek-v4-flash"
  | "deepseek-v4-pro"
  | "deepseek-chat"
  | "deepseek-reasoner";

const MODEL_STORAGE_KEY = "chat_model_id";
const THINKING_STORAGE_KEY = "chat_thinking_enabled";

export const DEFAULT_MODEL_ID: DeepSeekModelId = "deepseek-chat";

const VALID_MODELS = new Set<DeepSeekModelId>([
  "deepseek-v4-flash",
  "deepseek-v4-pro",
  "deepseek-chat",
  "deepseek-reasoner",
]);

export async function getChatModelId(): Promise<DeepSeekModelId> {
  const value = await AsyncStorage.getItem(MODEL_STORAGE_KEY);
  if (value && VALID_MODELS.has(value as DeepSeekModelId)) {
    return value as DeepSeekModelId;
  }
  return DEFAULT_MODEL_ID;
}

export async function setChatModelId(model: DeepSeekModelId): Promise<void> {
  await AsyncStorage.setItem(MODEL_STORAGE_KEY, model);
}

export async function getThinkingEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(THINKING_STORAGE_KEY);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return false;
}

export async function setThinkingEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(THINKING_STORAGE_KEY, enabled ? "true" : "false");
}

export function shouldUseThinking(
  model: DeepSeekModelId,
  thinkingEnabled: boolean
): boolean {
  return thinkingEnabled || model === "deepseek-reasoner";
}

/** V4 系列默认开启思考，需显式传 disabled 才能关闭 */
export function isV4Model(model: DeepSeekModelId): boolean {
  return model === "deepseek-v4-flash" || model === "deepseek-v4-pro";
}
