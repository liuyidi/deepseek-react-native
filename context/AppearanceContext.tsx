import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import {
  getAppearanceMode,
  setAppearanceMode as persistAppearanceMode,
  type AppearanceMode,
} from "@/lib/appearanceConfig";
import type { AppColorScheme } from "@/constants/Colors";

type AppearanceContextValue = {
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => Promise<void>;
  colorScheme: AppColorScheme;
  isReady: boolean;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<AppearanceMode>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void getAppearanceMode().then((savedMode) => {
      setModeState(savedMode);
      setIsReady(true);
    });
  }, []);

  const setMode = useCallback(async (nextMode: AppearanceMode) => {
    setModeState(nextMode);
    await persistAppearanceMode(nextMode);
  }, []);

  const colorScheme: AppColorScheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo(
    () => ({
      mode,
      setMode,
      colorScheme,
      isReady,
    }),
    [colorScheme, isReady, mode, setMode]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return context;
}
