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
  getAppLanguage,
  setAppLanguage as persistAppLanguage,
  type AppLanguage,
} from "@/lib/languageConfig";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  isReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("zh");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void getAppLanguage().then((savedLanguage) => {
      setLanguageState(savedLanguage);
      setIsReady(true);
    });
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await persistAppLanguage(nextLanguage);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isReady,
    }),
    [isReady, language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
