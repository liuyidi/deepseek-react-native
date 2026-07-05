import AsyncStorage from "@react-native-async-storage/async-storage";

export type TokenUsageStats = {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  lastUpdatedAt: string | null;
};

export type TokenUsageDelta = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

const TOKEN_USAGE_STORAGE_KEY = "token_usage_stats";

export const DEFAULT_TOKEN_USAGE_STATS: TokenUsageStats = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  requestCount: 0,
  lastUpdatedAt: null,
};

function normalizeStats(raw: Partial<TokenUsageStats> | null): TokenUsageStats {
  if (!raw) {
    return { ...DEFAULT_TOKEN_USAGE_STATS };
  }
  return {
    totalTokens: raw.totalTokens ?? 0,
    promptTokens: raw.promptTokens ?? 0,
    completionTokens: raw.completionTokens ?? 0,
    requestCount: raw.requestCount ?? 0,
    lastUpdatedAt: raw.lastUpdatedAt ?? null,
  };
}

export async function getTokenUsageStats(): Promise<TokenUsageStats> {
  const raw = await AsyncStorage.getItem(TOKEN_USAGE_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_TOKEN_USAGE_STATS };
  }
  try {
    return normalizeStats(JSON.parse(raw) as Partial<TokenUsageStats>);
  } catch {
    return { ...DEFAULT_TOKEN_USAGE_STATS };
  }
}

export async function addTokenUsage(delta: TokenUsageDelta): Promise<TokenUsageStats> {
  const current = await getTokenUsageStats();
  const prompt = delta.prompt_tokens ?? 0;
  const completion = delta.completion_tokens ?? 0;
  const total = delta.total_tokens ?? prompt + completion;

  const next: TokenUsageStats = {
    totalTokens: current.totalTokens + total,
    promptTokens: current.promptTokens + prompt,
    completionTokens: current.completionTokens + completion,
    requestCount: current.requestCount + 1,
    lastUpdatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(TOKEN_USAGE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function resetTokenUsageStats(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_USAGE_STORAGE_KEY);
}

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 10_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(2)}K`;
  }
  return count.toLocaleString("zh-CN");
}
