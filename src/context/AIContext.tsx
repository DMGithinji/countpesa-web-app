import { createContext, useMemo, ReactNode, useContext, useState, useCallback } from "react";
import useAIMessageStore from "@/stores/aiMessages.store";

interface AIContextType {
  // Correlation id issued by the backend; null until the first reply
  sessionId: string | null;
  setSessionId: (id: string) => void;
  refreshChat: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const clearMessages = useAIMessageStore((state) => state.clearMessages);

  const refreshChat = useCallback(() => {
    setSessionId(null);
    clearMessages();
  }, [clearMessages]);

  const contextValue = useMemo(
    () => ({ sessionId, setSessionId, refreshChat }),
    [sessionId, refreshChat]
  );

  return <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>;
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAIContext must be used within a AIContextProvider");
  }
  return context;
}
