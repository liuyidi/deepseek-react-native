import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  nickname: string;
  bio: string;
  avatarColor: string;
};

const PROFILE_STORAGE_KEY = "user_profile";

export const DEFAULT_PROFILE: UserProfile = {
  nickname: "DeepSeek 用户",
  bio: "探索 AI 对话的更多可能",
  avatarColor: "#1063FD",
};

export async function getUserProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PROFILE;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      nickname: parsed.nickname?.trim() || DEFAULT_PROFILE.nickname,
      bio: parsed.bio?.trim() || DEFAULT_PROFILE.bio,
      avatarColor: parsed.avatarColor || DEFAULT_PROFILE.avatarColor,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
}

export function getProfileInitial(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return "U";
  }
  return trimmed.slice(0, 1).toUpperCase();
}
