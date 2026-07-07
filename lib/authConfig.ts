import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import type { AuthUser, StoredAuthSession } from "@/types/auth";

const ACCESS_TOKEN_KEY = "chat_api_access_token";
const REFRESH_TOKEN_KEY = "chat_api_refresh_token";
const SESSION_META_KEY = "chat_api_session_meta";

type SessionMeta = {
  user: AuthUser;
  expiresAt: number;
};

export async function getStoredAuthSession(): Promise<StoredAuthSession | null> {
  const [accessToken, refreshToken, metaRaw] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    AsyncStorage.getItem(SESSION_META_KEY),
  ]);

  if (!accessToken || !refreshToken || !metaRaw) {
    return null;
  }

  try {
    const meta = JSON.parse(metaRaw) as SessionMeta;
    if (!meta.user?.id || !meta.expiresAt) {
      return null;
    }

    return {
      user: meta.user,
      accessToken,
      refreshToken,
      expiresAt: meta.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function saveAuthSession(
  user: AuthUser,
  accessToken: string,
  refreshToken: string,
  expiresInSeconds: number
): Promise<StoredAuthSession> {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const meta: SessionMeta = { user, expiresAt };

  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    AsyncStorage.setItem(SESSION_META_KEY, JSON.stringify(meta)),
  ]);

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export async function updateStoredAuthUser(user: AuthUser): Promise<void> {
  const metaRaw = await AsyncStorage.getItem(SESSION_META_KEY);
  if (!metaRaw) {
    return;
  }

  try {
    const meta = JSON.parse(metaRaw) as SessionMeta;
    await AsyncStorage.setItem(
      SESSION_META_KEY,
      JSON.stringify({ ...meta, user })
    );
  } catch {
    // ignore corrupt session meta
  }
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(SESSION_META_KEY),
  ]);
}

export function isAccessTokenExpired(expiresAt: number, skewMs = 60_000): boolean {
  return Date.now() >= expiresAt - skewMs;
}
