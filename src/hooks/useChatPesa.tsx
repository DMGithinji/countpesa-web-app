import { useCallback, useState } from "react";
import { Filter } from "@/types/Filters";
import useAIMessageStore from "@/stores/aiMessages.store";
import useTransactionStore, { getDerivedState } from "@/stores/transactions.store";
import { useAIContext } from "@/context/AIContext";
import { useTransactionRepository } from "@/context/RepositoryContext";
import { submitData } from "@/lib/feedbackUtils";
import { getFollowUpPrompt, getInitialPrompt } from "@/prompts/composer";
import { handleResponse } from "@/prompts/utils/processAIResponse";

export const useChatPesa = () => {
  const { filterChat, analysisModel, refreshChat } = useAIContext();
  const setCurrentFilters = useTransactionStore((state) => state.setCurrentFilters);
  const transactionsRepository = useTransactionRepository();
  const allTransactions = useTransactionStore((state) => state.allTransactions);

  const messages = useAIMessageStore((state) => state.messages);
  const setMessage = useAIMessageStore((state) => state.setMessage);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const doFollowUpAnalysis = useCallback(
    async (question: string, setFilters: Filter[]) => {
      const derivedState = getDerivedState(allTransactions, setFilters);
      if (!derivedState?.transactions.length) return;
      const prompt = getFollowUpPrompt(derivedState, question);
      const result = await analysisModel.generateContent(prompt);
      const response = result.response.text();
      const processedResponse = handleResponse(response);
      console.log({ response, processedResponse });
      setMessage({ sender: "bot", text: processedResponse.message });
    },
    [allTransactions, analysisModel, setMessage]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      const isFirst = messages.length === 1;
      let prompt = message;
      if (isFirst) {
        const allTrs = await transactionsRepository.getTransactions();
        prompt = await getInitialPrompt(allTrs, message);
      }

      setInput("");
      setMessage({ sender: "user", text: message });
      setTimeout(async () => {
        setIsLoading(true);
        try {
          const result = await filterChat.sendMessage(prompt);
          const response = result.response.text();
          const processedResponse = handleResponse(response);
          console.log({ response, processedResponse });
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
      filterChat,
      doFollowUpAnalysis,
      messages.length,
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
