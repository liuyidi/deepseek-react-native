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
  DEFAULT_MODEL_ID,
  getChatModelId,
  getThinkingEnabled,
  setChatModelId as persistChatModelId,
  setThinkingEnabled as persistThinkingEnabled,
  shouldUseThinking,
  type DeepSeekModelId,
} from "@/lib/chatPreferencesConfig";

type ChatPreferencesContextValue = {
  model: DeepSeekModelId;
  setModel: (model: DeepSeekModelId) => Promise<void>;
  thinkingEnabled: boolean;
  setThinkingEnabled: (enabled: boolean) => Promise<void>;
  isThinkingActive: boolean;
  isReady: boolean;
};

const ChatPreferencesContext = createContext<ChatPreferencesContextValue | null>(
  null
);

export function ChatPreferencesProvider({ children }: { children: ReactNode }) {
  const [model, setModelState] = useState<DeepSeekModelId>(DEFAULT_MODEL_ID);
  const [thinkingEnabled, setThinkingState] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void Promise.all([getChatModelId(), getThinkingEnabled()]).then(
      ([savedModel, savedThinking]) => {
        setModelState(savedModel);
        setThinkingState(savedThinking);
        setIsReady(true);
      }
    );
  }, []);

  const setModel = useCallback(async (nextModel: DeepSeekModelId) => {
    setModelState(nextModel);
    await persistChatModelId(nextModel);
  }, []);

  const setThinkingEnabled = useCallback(async (enabled: boolean) => {
    setThinkingState(enabled);
    await persistThinkingEnabled(enabled);
  }, []);

  const isThinkingActive = shouldUseThinking(model, thinkingEnabled);

  const value = useMemo(
    () => ({
      model,
      setModel,
      thinkingEnabled,
      setThinkingEnabled,
      isThinkingActive,
      isReady,
    }),
    [isReady, isThinkingActive, model, setModel, setThinkingEnabled, thinkingEnabled]
  );

  return (
    <ChatPreferencesContext.Provider value={value}>
      {children}
    </ChatPreferencesContext.Provider>
  );
}

export function useChatPreferences() {
  const context = useContext(ChatPreferencesContext);
  if (!context) {
    throw new Error("useChatPreferences must be used within ChatPreferencesProvider");
  }
  return context;
}
