import { useEffect, useState } from "react";

import { useAppearance } from "@/context/AppearanceContext";

/**
 * Web 静态渲染需等客户端 hydration 后再应用外观偏好。
 */
export function useColorScheme() {
  const { colorScheme } = useAppearance();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return "light";
  }

  return colorScheme;
}
