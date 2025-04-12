import { create } from "zustand";

import { useAppStore } from "@/stores/useAppStore";
import { useConnectionsStore } from "@/stores/useConnectionsStore";
import { useStreamsStore } from "@/stores/useStreamsStore";
import { useUserStore } from "@/stores/useUserStore";
import { Call } from "@/types/call";
import { CallStore } from "@/types/storeInterfaces";

const getStreamsStoreActions = () => useStreamsStore.getState().actions;
const getConnectionsStoreActions = () => useConnectionsStore.getState().actions;
const getStreamsStoreState = () => useStreamsStore.getState();
const getConnections = () => useConnectionsStore.getState().connections;
const socketEmit = useAppStore.getState().actions.socketEmit;
const getUserId = () => useUserStore.getState().user?._id;

export const useCallStore = create<CallStore>((set, get) => ({
  currentCall: null,
  incomingCalls: [],
  joiningCall: null,

  actions: {
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
    resetIncomingCalls: () => set({ incomingCalls: [] }),
    setJoiningCall: (chatId) => set(() => ({ joiningCall: chatId })),
    startCall: async (chat, videoEnabled) => {
      const userId = getUserId();

      if (!chat || !userId) return;

      const { addStream } = getStreamsStoreActions();
      const attachStreamToCall = getStreamsStoreActions().attachStreamToCall;

      const currUserStream = await attachStreamToCall({
        videoEnabled,
        audioEnabled: true,
      });
      if (!currUserStream) return;
      addStream(userId, currUserStream);

      socketEmit(
        "joinCall",
        {
          chatId: chat._id,
          isInitiator: true,
        },
        ({ call }: { call: Call }) => {
          if (call) {
            get().actions.setCurrentCall(call);
          }
        }
      );
    },
    answerCall: async (callDetails, videoEnabled) => {
      const userId = getUserId();
      if (!callDetails || !userId) return;

      const { addStream } = getStreamsStoreActions();
      const attachStreamToCall = getStreamsStoreActions().attachStreamToCall;

      const currUserStream = await attachStreamToCall({
        videoEnabled: videoEnabled,
        audioEnabled: true,
      });
      if (!currUserStream) return;
      addStream(userId, currUserStream);
      get().actions.setJoiningCall(callDetails.chatId._id);
      get().actions.removeIncomingCall(callDetails.chatId._id);

      socketEmit(
        "joinCall",
        {
          chatId: callDetails.chatId._id,
        },
        ({ call }: { call: Call }) => {
          if (call) {
            get().actions.setCurrentCall(call);
            get().actions.setJoiningCall(null);
          }
        },
        { timeout: 1500 }
      );
    },
    endCall: async (call) => {
      const userId = getUserId();
      if (!userId) return;

      const { streams } = getStreamsStoreState();
      const { setIsUserMicrophoneMuted, setIsUserSharingVideo, removeStream } =
        getStreamsStoreActions();
      const { resetConnections } = getConnectionsStoreActions();

      const userStream = streams[userId]?.stream;
      const peerConnections = getConnections();
      if (
        call.participants.some(
          (participant) => participant.userId._id === userId
        )
      ) {
        socketEmit("endCall", { chatId: call?.chatId?._id });
        get().actions.setCurrentCall(null);
      }
      userStream?.getTracks().forEach((track) => track.stop());
      Object.values(peerConnections).forEach((peer) => {
        peer.destroy();
      });
      removeStream(userId);

      resetConnections();
      setIsUserSharingVideo(false);
      setIsUserMicrophoneMuted(false);
    },
    rejectCall: async (call) => {
      socketEmit("rejectCall", { chatId: call?.chatId?._id });
      get().actions.removeIncomingCall(call.chatId._id);
    },
  },
}));

export const useCallStoreActions = () => useCallStore((state) => state.actions);
