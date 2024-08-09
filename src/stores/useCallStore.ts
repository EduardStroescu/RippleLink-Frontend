import { CallStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useCallStore = create<CallStore>((set) => ({
  streams: {},
  connections: {},
  currentCall: null,
  answeredCall: false,
  // incomingCalls: [],

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
    resetConnections: () => set({ connections: {} }),
    setCurrentCall: (call) => set({ currentCall: call }),
    setAnsweredCall: (newState) => set(() => ({ answeredCall: newState })),
    // setIncomingCalls: (newValue) =>
    //   set((prevState) => ({
    //     incomingCalls:
    //       typeof newValue === "function"
    //         ? newValue(prevState.incomingCalls)
    //         : newValue,
    //   })),
  },
}));

export const useCallStoreActions = () => useCallStore((state) => state.actions);
