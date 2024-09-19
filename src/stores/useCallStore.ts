import { CallStore } from "@/types/storeInterfaces";
import { create } from "zustand";
import { useUserStore } from "./useUserStore";
import { useAppStore } from "./useAppStore";
import { Call } from "@/types";
import { useStreamsStore } from "./useStreamsStore";
import { useConnectionsStore } from "./useConnectionsStore";

const getStreamsStoreActions = () => useStreamsStore.getState().actions;
const getConnectionsStoreActions = () => useConnectionsStore.getState().actions;
const getStreamsStoreState = () => useStreamsStore.getState();
const getConnectionsStoreState = () => useConnectionsStore.getState();
const getAppStoreState = () => useAppStore.getState();
const getUserStoreState = () => useUserStore.getState();

export const useCallStore = create<CallStore>((set, get) => ({
  currentCall: null,
  incomingCalls: [],
  recentlyEndedCalls: [],
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
    setJoiningCall: (chatId) => set(() => ({ joiningCall: chatId })),
    startCall: async (chat, videoEnabled) => {
      const userId = getUserStoreState().user?._id;
      const { socket } = getAppStoreState();
      const { addStream } = getStreamsStoreActions();
      const attachStreamToCall = getStreamsStoreActions().attachStreamToCall;

      if (!chat || !userId || !socket) return;

      const currUserStream = await attachStreamToCall({
        videoEnabled,
        audioEnabled: true,
      });
      if (!currUserStream) return;
      addStream(userId, currUserStream);

      socket.emit("joinCall", {
        chatId: chat._id,
        isInitiator: true,
      });
      socket.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          get().actions.setCurrentCall(data.call);
          socket.off("callJoined");
        }
      });
    },
    answerCall: async (callDetails, videoEnabled) => {
      const userId = getUserStoreState().user?._id;
      const { socket } = getAppStoreState();
      const { addStream } = getStreamsStoreActions();
      const attachStreamToCall = getStreamsStoreActions().attachStreamToCall;
      if (!callDetails || !userId || !socket) return;

      const currUserStream = await attachStreamToCall({
        videoEnabled,
        audioEnabled: true,
      });
      if (!currUserStream) return;
      addStream(userId, currUserStream);
      get().actions.setJoiningCall(callDetails.chatId._id);

      socket.emit("joinCall", {
        chatId: callDetails.chatId._id,
      });

      socket.on("callJoined", (data: { call: Call }) => {
        if (data.call) {
          get().actions.setCurrentCall(data.call);
          get().actions.setJoiningCall(null);
          socket.off("callJoined");
        }
      });
    },
    endCall: (call) => {
      const userId = getUserStoreState().user?._id;
      const { streams } = getStreamsStoreState();
      const { setIsUserMicrophoneMuted, setIsUserSharingVideo } =
        getStreamsStoreActions();
      const { socket } = getAppStoreState();
      const { resetConnections } = getConnectionsStoreActions();

      if (!userId || !socket) return;
      const userStream = streams[userId]?.stream;
      const peerConnections = getConnectionsStoreState().connections;
      if (
        call.participants.some(
          (participant) => participant.userId._id === userId
        )
      ) {
        socket.emit("endCall", { callId: call._id });
        get().actions.addRecentlyEndedCall(call);
        get().actions.setCurrentCall(null);
      }
      userStream?.getTracks().forEach((track) => track.stop());
      Object.values(peerConnections).forEach((peer) => {
        peer.destroy();
      });
      resetConnections();
      setIsUserSharingVideo(false);
      setIsUserMicrophoneMuted(false);
    },
  },
}));

export const useCallStoreActions = () => useCallStore((state) => state.actions);
