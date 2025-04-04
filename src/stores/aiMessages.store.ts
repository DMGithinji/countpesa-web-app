import { create } from 'zustand';
import { AssessmentMode, Message } from '@/types/AITools';

interface AIMessagesState {
  assessmentMode: AssessmentMode;
  setAssessmentMode: (mode: AssessmentMode) => void;

  messages: Message[];
  setMessage: (message: Message) => void;
}

const useAIMessageStore = create<AIMessagesState>((set) => ({
  assessmentMode: AssessmentMode.SERIOUS,
  setAssessmentMode: (mode) => set({ assessmentMode: mode }),

  messages: [{ sender: 'bot', text: "Hi! 👋🏾 I'm ChatPesa.\nHere to help you understand your money better and navigate this app. What can I help you with today?" }],
  setMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

export default useAIMessageStore;
