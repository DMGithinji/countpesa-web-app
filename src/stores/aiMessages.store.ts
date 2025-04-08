import { create } from "zustand";
import { AssessmentMode, Message } from "@/types/AITools";

export const DEFAULT_AI_MESSAGES: Message[] = [
  {
    sender: "bot",
    text: "Hi! 👋🏾 I'm ChatPesa.\nHere to help you understand your money better and navigate this app. What can I help you with today?",
  },
];
interface AIMessagesState {
  assessmentMode: AssessmentMode;
  setAssessmentMode: (mode: AssessmentMode) => void;

  messages: Message[];
  setMessage: (message: Message) => void;
  clearMessages: () => void;
}

const useAIMessageStore = create<AIMessagesState>((set) => ({
  assessmentMode: AssessmentMode.SERIOUS,
  setAssessmentMode: (mode) => set({ assessmentMode: mode }),

  messages: DEFAULT_AI_MESSAGES,
  setMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: DEFAULT_AI_MESSAGES }),
}));

export default useAIMessageStore;
