import Constants from "expo-constants";
import { Platform } from "react-native";

const AUTH_API_PREFIX = "/api/v1/auth";

function resolveDevBaseUrl(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }
  return "http://127.0.0.1:8000";
}

/** Base URL for deepseek-chat-api (no trailing slash). */
export function getChatApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.chatApiBaseUrl;
  if (typeof fromExtra === "string" && fromExtra.trim().length > 0) {
    return fromExtra.trim().replace(/\/$/, "");
  }

  if (__DEV__) {
    return resolveDevBaseUrl();
  }

  return "https://deepseek-chat-api.up.railway.app";
}

export function getAuthApiUrl(path: "" | "register" | "login" | "refresh" | "logout"): string {
  const suffix = path ? `/${path}` : "";
  return `${getChatApiBaseUrl()}${AUTH_API_PREFIX}${suffix}`;
}
