import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { getDeepSeekApiKey } from "@/lib/deepseekConfig";

export function useDeepSeekApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadApiKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedKey = await getDeepSeekApiKey();
      setApiKey(storedKey);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reloadApiKey();
    }, [reloadApiKey])
  );

  return {
    apiKey,
    hasApiKey: Boolean(apiKey),
    isLoading,
    reloadApiKey,
  };
}
