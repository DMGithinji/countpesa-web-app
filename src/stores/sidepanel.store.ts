import { create } from 'zustand';


interface SidepanelState {
  sidepanelOpen: boolean;

  setSidepanelOpen: (open: boolean) => void;
}

// Create the minimal Zustand store
const useSidepanelStore = create<SidepanelState>((set) => ({
  // Initial state
  sidepanelOpen: true,

  // Simple setters
  setSidepanelOpen: (sidepanelOpen) => set({ sidepanelOpen }),
}));

export default useSidepanelStore;
