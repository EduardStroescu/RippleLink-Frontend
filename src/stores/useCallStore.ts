import { CallStore } from "@/types/storeInterfaces";
import { create } from "zustand";

export const useCallStore = create<CallStore>((set) => ({
  streams: {},
  connections: {},
  currentCall: null,
  incomingCalls: [],
  recentlyEndedCalls: [],
  joiningCall: null,
  isUserSharingVideo: false,
  isUserMicrophoneMuted: false,
  selectedDevices: {
    audioInput: undefined,
    audioOutput: undefined,
    videoInput: undefined,
  },

  actions: {
    addStream: (participantId, stream) =>
      set((state) => {
        const streams = {
          ...state.streams,
          [participantId]: {
            stream,
            shouldDisplayPopUp:
              state.streams[participantId]?.shouldDisplayPopUp !== false
                ? true
                : false,
          },
        };
        return { streams: { ...streams } };
      }),
    removeStream: (id) =>
      set((state) => {
        const newStreams = { ...state.streams };
        newStreams[id].stream = null;
        return { streams: newStreams };
      }),
    toggleStreamPopUp: (id) =>
      set((state) => {
        const newStreams = { ...state.streams };
        newStreams[id].shouldDisplayPopUp = !newStreams[id].shouldDisplayPopUp;
        return { streams: newStreams };
      }),
    addConnection: (participantId, peer) =>
      set((state) => {
        const updatedConnections = { ...state.connections };
        updatedConnections[participantId] = peer;
        return { connections: updatedConnections };
      }),
    removeConnection: (id) =>
      set((state) => {
        const newConnections = { ...state.connections };
        delete newConnections[id];
        return { connections: newConnections };
      }),
    resetConnections: () => set({ connections: {} }),
    setCurrentCall: (call) => set({ currentCall: call }),
    addIncomingCall: (newCall) =>
      set((state) => {
        if (!newCall || !newCall.chatId._id) return state;

        const existingCallIndex = state.incomingCalls.findIndex(
          (call) => call && call.chatId._id === newCall.chatId._id
        );
        if (existingCallIndex !== -1) {
          const updatedCalls = [...state.incomingCalls];
          updatedCalls[existingCallIndex] = newCall;
          return { incomingCalls: updatedCalls };
        } else {
          return { incomingCalls: [...state.incomingCalls, newCall] };
        }
      }),
    removeIncomingCall: (chatId) =>
      set((state) => ({
        incomingCalls: state.incomingCalls.filter(
          (call) => call && call.chatId._id !== chatId
        ),
      })),
    addRecentlyEndedCall: (newEndedCall) =>
      set((state) => {
        if (!newEndedCall || !newEndedCall.chatId._id) return state;

        const existingCallIndex = state.recentlyEndedCalls.findIndex(
          (call) => call && call.chatId._id === newEndedCall.chatId._id
        );
        if (existingCallIndex !== -1) {
          const updatedCalls = [...state.incomingCalls];
          updatedCalls[existingCallIndex] = newEndedCall;
          return { recentlyEndedCalls: updatedCalls };
        } else {
          return {
            recentlyEndedCalls: [...state.recentlyEndedCalls, newEndedCall],
          };
        }
      }),
    removeRecentlyEndedCall: (chatId) =>
      set((state) => ({
        recentlyEndedCalls: state.recentlyEndedCalls.filter(
          (call) => call && call.chatId._id !== chatId
        ),
      })),
    resetIncomingCalls: () => set({ incomingCalls: [] }),
    setIsUserSharingVideo: (newState) =>
      set(() => ({ isUserSharingVideo: newState })),
    setIsUserMicrophoneMuted: (newState) =>
      set(() => ({ isUserMicrophoneMuted: newState })),
    setJoiningCall: (chatId) => set(() => ({ joiningCall: chatId })),
    setSelectedDevices: (updatedDevices) =>
      set((state) => ({
        selectedDevices: { ...state.selectedDevices, ...updatedDevices },
      })),
  },
}));

export const useCallStoreActions = () => useCallStore((state) => state.actions);
