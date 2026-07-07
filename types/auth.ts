/** Mirrors deepseek-chat-api app/schemas/auth.py */

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type TokenResponse = AuthTokens;

export type RegisterPayload = {
  email: string;
  password: string;
  nickname?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type StoredAuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};
