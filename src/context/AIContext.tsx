import React, { createContext, useMemo, ReactNode, useContext } from "react";

import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";

interface AIContextType {
  AIChat: ChatSession;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const AIChat = useMemo(() => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: [],
    });
    return chat;
  }, []);

  const contextValue = {
    AIChat,
  };

  return (
    <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>
  );
};

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAIContext must be used within a AIContextProvider");
  }
  return context;
}
