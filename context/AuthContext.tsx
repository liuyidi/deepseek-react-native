import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  loginUser,
  logoutUserApi,
  refreshAuthTokens,
  registerUser,
} from "@/lib/authApi";
import {
  clearAuthSession,
  getStoredAuthSession,
  isAccessTokenExpired,
  saveAuthSession,
} from "@/lib/authConfig";
import { setAccountInfo, DEFAULT_ACCOUNT, clearAccountInfo } from "@/lib/accountConfig";
import { setAppearanceMode } from "@/lib/appearanceConfig";
import { clearDeepSeekApiKey } from "@/lib/deepseekConfig";
import {
  clearUserProfile,
  DEFAULT_PROFILE,
  setUserProfile,
} from "@/lib/userProfileConfig";
import type { AuthUser, LoginPayload, RegisterPayload, StoredAuthSession } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  session: StoredAuthSession | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  canAccessApp: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncUserToLocalProfile(user: AuthUser): Promise<void> {
  await Promise.all([
    setUserProfile({
      nickname: user.nickname,
      bio: user.bio?.trim() || DEFAULT_PROFILE.bio,
      avatarColor: DEFAULT_PROFILE.avatarColor,
    }),
    setAccountInfo({
      ...DEFAULT_ACCOUNT,
      email: user.email,
      phone: user.phone ?? "",
    }),
  ]);
}

async function clearLocalUserData(): Promise<void> {
  await Promise.all([
    clearAuthSession(),
    clearUserProfile(),
    clearAccountInfo(),
    clearDeepSeekApiKey(),
    setAppearanceMode("system"),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void getStoredAuthSession().then((stored) => {
      setSession(stored);
      setIsReady(true);
    });
  }, []);

  const applyAuthResponse = useCallback(
    async (user: AuthUser, accessToken: string, refreshToken: string, expiresIn: number) => {
      const nextSession = await saveAuthSession(user, accessToken, refreshToken, expiresIn);
      await syncUserToLocalProfile(user);
      setSession(nextSession);
    },
    []
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginUser(payload);
      setIsGuest(false);
      await applyAuthResponse(
        response.user,
        response.tokens.access_token,
        response.tokens.refresh_token,
        response.tokens.expires_in
      );
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerUser(payload);
      setIsGuest(false);
      await applyAuthResponse(
        response.user,
        response.tokens.access_token,
        response.tokens.refresh_token,
        response.tokens.expires_in
      );
    },
    [applyAuthResponse]
  );

  const logout = useCallback(async () => {
    if (session?.refreshToken) {
      await logoutUserApi(session.refreshToken);
    }
    await clearLocalUserData();
    setSession(null);
    setIsGuest(false);
  }, [session?.refreshToken]);

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!session) {
      return null;
    }

    if (!isAccessTokenExpired(session.expiresAt)) {
      return session.accessToken;
    }

    try {
      const tokens = await refreshAuthTokens(session.refreshToken);
      const nextSession = await saveAuthSession(
        session.user,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in
      );
      setSession(nextSession);
      return nextSession.accessToken;
    } catch {
      await clearLocalUserData();
      setSession(null);
      return null;
    }
  }, [session]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isGuest,
      canAccessApp: Boolean(session?.accessToken) || isGuest,
      isReady,
      login,
      register,
      logout,
      enterGuestMode,
      getAccessToken,
    }),
    [session, isGuest, isReady, login, register, logout, enterGuestMode, getAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
