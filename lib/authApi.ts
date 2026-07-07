import axios from "axios";

import { getAuthApiUrl } from "@/lib/chatApiConfig";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
} from "@/types/auth";

type FastApiErrorBody = {
  detail?: string | { msg?: string; loc?: string[] }[];
};

function parseApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as FastApiErrorBody | undefined;
    const detail = data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (first?.msg) {
        return first.msg;
      }
    }

    if (error.message === "Network Error") {
      return "无法连接服务器，请确认 deepseek-chat-api 已启动。";
    }
  }

  return fallback;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      getAuthApiUrl("register"),
      {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        nickname: payload.nickname?.trim() || undefined,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseApiError(error, "注册失败，请稍后重试。"));
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      getAuthApiUrl("login"),
      {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseApiError(error, "登录失败，请检查邮箱和密码。"));
  }
}

export async function refreshAuthTokens(refreshToken: string): Promise<TokenResponse> {
  try {
    const response = await axios.post<TokenResponse>(
      getAuthApiUrl("refresh"),
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseApiError(error, "登录已过期，请重新登录。"));
  }
}

export async function logoutUserApi(refreshToken: string): Promise<void> {
  try {
    await axios.post(
      getAuthApiUrl("logout"),
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch {
    // Best-effort logout; local session is cleared regardless.
  }
}
