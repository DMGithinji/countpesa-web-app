import { create } from 'zustand';
import { AssessmentMode, Message } from '@/types/AITools';

interface AIMessagesState {
  assessmentMode: AssessmentMode;
  selectAssessmentMode: (mode: AssessmentMode) => void;

  messages: Message[];
  setMessage: (message: Message) => void;
}

const useAIMessageStore = create<AIMessagesState>((set) => ({
  assessmentMode: AssessmentMode.SERIOUS,
  selectAssessmentMode: (mode) => set({ assessmentMode: mode }),

  messages: [{ sender: 'bot', text: "Hey 👋🏾, ChatPesa here. How can I help you today?" }],
  setMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

export default useAIMessageStore;
