import { useCallback, useEffect, useRef, useState } from "react";
import { Filter } from "@/types/Filters";
import useAIMessageStore from "@/stores/aiMessages.store";
import useTransactionStore, { getDerivedState } from "@/stores/transactions.store";
import { useAIContext } from "@/context/AIContext";
import { useTransactionRepository } from "@/context/RepositoryContext";
import { submitData } from "@/lib/feedbackUtils";
import { buildChatContext, ChatContextPayload, postAnalysis, postChatQuery } from "@/lib/aiApi";
import { handleResponse } from "@/prompts/utils/processAIResponse";

export const useChatPesa = () => {
  const { sessionId, setSessionId, refreshChat } = useAIContext();
  const setCurrentFilters = useTransactionStore((state) => state.setCurrentFilters);
  const transactionsRepository = useTransactionRepository();
  const allTransactions = useTransactionStore((state) => state.allTransactions);

  const messages = useAIMessageStore((state) => state.messages);
  const setMessage = useAIMessageStore((state) => state.setMessage);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Catalog + summary of the user's data, rebuilt whenever a conversation starts
  const contextRef = useRef<ChatContextPayload | null>(null);

  useEffect(() => {
    if (messages.length === 1) {
      contextRef.current = null;
    }
  }, [messages.length]);

  const doFollowUpAnalysis = useCallback(
    async (question: string, setFilters: Filter[]) => {
      const derivedState = getDerivedState(allTransactions, setFilters);
      if (!derivedState?.transactions.length) return;
      const result = await postAnalysis({
        mode: "followup",
        derivedData: derivedState,
        filters: [],
        question,
        sessionId,
      });
      setMessage({ sender: "bot", text: result.response });
    },
    [allTransactions, sessionId, setMessage]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      setInput("");
      setMessage({ sender: "user", text: message });
      setTimeout(async () => {
        setIsLoading(true);
        try {
          if (!contextRef.current) {
            const allTrs = await transactionsRepository.getTransactions();
            contextRef.current = buildChatContext(allTrs);
          }

          const result = await postChatQuery({
            query: message,
            context: contextRef.current,
            messages,
            sessionId,
          });
          setSessionId(result.session_id);

          const processedResponse = handleResponse(result.output);
          setMessage({ sender: "bot", text: processedResponse.message });
          setIsLoading(false);

          if (processedResponse.filters?.length) {
            setCurrentFilters(processedResponse.filters);
            setIsLoading(true);
            await doFollowUpAnalysis(message, processedResponse.filters);
            setIsLoading(false);
          }
        } catch (error) {
          submitData({
            type: "error",
            message: JSON.stringify({
              name: `Chatpesa Error`,
              error,
              timestamp: new Date().toISOString(),
            }),
          });
          setIsLoading(false);
          setMessage({
            sender: "bot",
            text: "Sorry, there was an error generating your financial assessment. Please try again.",
          });
        }
      }, 600);
    },
    [
      messages,
      sessionId,
      setSessionId,
      doFollowUpAnalysis,
      setCurrentFilters,
      setMessage,
      transactionsRepository,
    ]
  );

  return {
    messages,
    isLoading,
    input,
    setInput,
    handleSendMessage,
    refreshChat,
  };
};
