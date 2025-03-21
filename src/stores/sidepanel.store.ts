import { AssessmentMode } from '@/types/PromptTemplate';
import { create } from 'zustand';


interface SidepanelState {
  sidepanelOpen: boolean;
  setSidepanelOpen: (open: boolean) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  assessmentMode: AssessmentMode;
  selectAssessmentMode: (mode: AssessmentMode) => void;
}

// Create the minimal Zustand store
const useSidepanelStore = create<SidepanelState>((set) => ({
  sidepanelOpen: false,
  setSidepanelOpen: (sidepanelOpen) => set({ sidepanelOpen }),

  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),

  assessmentMode: AssessmentMode.SERIOUS,
  selectAssessmentMode: (mode) => set({ assessmentMode: mode }),
}));

export default useSidepanelStore;
