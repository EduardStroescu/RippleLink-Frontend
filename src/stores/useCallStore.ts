import { CallStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useCallStore = create<CallStore>((set) => ({
  streams: {},
  connections: {},
  currentCall: null,

  actions: {
    addStream: (participantId, stream) =>
      set((state) => ({
        streams: { ...state.streams, [participantId]: stream },
      })),
    removeStream: (id) =>
      set((state) => {
        const newStreams = { ...state.streams };
        delete newStreams[id];
        return { streams: newStreams };
      }),
    addConnection: (participantId, peer) =>
      set((state) => ({
        connections: { ...state.connections, [participantId]: peer },
      })),
    removeConnection: (id) =>
      set((state) => {
        const newConnections = { ...state.connections };
        delete newConnections[id];
        return { connections: newConnections };
      }),
    setCurrentCall: (call) => set({ currentCall: call }),
  },
}));

export const useCallStoreActions = () => useCallStore((state) => state.actions);
