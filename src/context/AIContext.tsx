import { createContext, useMemo, ReactNode, useContext, useState, useCallback } from "react";
import { ChatSession, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import useAIMessageStore from "@/stores/aiMessages.store";

interface AIContextType {
  filterChat: ChatSession;
  analysisModel: GenerativeModel;
  refreshChat: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [refreshCount, setRefreshCount] = useState(0);
  const clearMessages = useAIMessageStore((state) => state.clearMessages);

  const AIChat = useMemo(() => {
    const filterGeneratorAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const filteringModel = filterGeneratorAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const filterChat = filteringModel.startChat({ history: [] });

    const analysisAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const analysisModel = analysisAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    return { filterChat, analysisModel };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCount]);

  const refreshChat = useCallback(() => {
    setRefreshCount((count) => count + 1);
    clearMessages();
  }, [clearMessages]);

  const contextValue = useMemo(() => ({ ...AIChat, refreshChat }), [AIChat, refreshChat]);

  return <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>;
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAIContext must be used within a AIContextProvider");
  }
  return context;
}
