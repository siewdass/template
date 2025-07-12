import { create } from 'zustand';

interface NavigationStore {
  navigate: (path: string) => void;
  setNavigate: (navigate: (path: string) => void) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  navigate: () => {
    throw new Error("Navigate function not initialized");
  },
  setNavigate: (navigate) => set({ navigate }),
}));