import { create } from "zustand";
import { type GeneratedMusic } from "@/utils/constants";

interface MusicStore {
  library: GeneratedMusic[];
  currentTrack: GeneratedMusic | null;
  isPlaying: boolean;
  addMusic: (music: GeneratedMusic) => void;
  setLibrary: (library: GeneratedMusic[]) => void;
  setCurrentTrack: (track: GeneratedMusic | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  deleteMusic: (id: string) => void;
}

export const useMusicStore = create<MusicStore>()((set) => ({
  library: [],
  currentTrack: null,
  isPlaying: false,

  addMusic: (music) =>
    set((state) => ({
      library: [music, ...state.library],
    })),

  setLibrary: (library) => set({ library }),

  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  deleteMusic: (id) =>
    set((state) => ({
      library: state.library.filter((m) => m.id !== id),
      currentTrack: state.currentTrack?.id === id ? null : state.currentTrack,
    })),
}));
