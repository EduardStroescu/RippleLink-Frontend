import Peer, { SignalData } from "simple-peer";
import { create } from "zustand";

import { useAppStore } from "@/stores/useAppStore";
import { useStreamsStore } from "@/stores/useStreamsStore";
import { useUserStore } from "@/stores/useUserStore";
import { ConnectionsStore } from "@/types/storeInterfaces";

const getStreamsStoreActions = () => useStreamsStore.getState().actions;
const getStreams = () => useStreamsStore.getState().streams;
const socketEmit = useAppStore.getState().actions.socketEmit;
const getUserId = () => useUserStore.getState().user?._id;

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  connections: {},

  actions: {
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
    sendCallOffers: async (participant, currentCall) => {
      const userId = getUserId();
      if (!userId) return;

      const streams = getStreams();
      const { addStream, removeStream } = getStreamsStoreActions();

      const userStream = streams[userId]?.stream;
      if (!participant || !currentCall || !userStream) return;

      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: userStream,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
      });

      peer.on("signal", (data) => {
        if (data.type === "candidate") {
          socketEmit("saveIceCandidates", {
            iceCandidates: JSON.stringify(data),
            chatId: currentCall.chatId._id,
            candidatesType: "offer",
            to: participant.userId._id,
          });
        } else {
          socketEmit("sendCallEvent", {
            chatId: currentCall.chatId._id,
            offer: JSON.stringify(data),
            participantId: participant.userId._id,
            saveToDb: data.type === "offer",
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("track", (_, stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("close", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        peer.destroy();
      });

      peer.on("error", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        peer.destroy();
      });

      get().actions.addConnection(participant.userId._id, peer);
    },
    sendCallAnswers: async (participant, currentCall) => {
      const userId = getUserId();
      if (!userId) return;

      const streams = getStreams();
      const { addStream, removeStream } = getStreamsStoreActions();

      const userStream = streams[userId]?.stream;
      if (!participant || !currentCall || !participant.offers || !userStream)
        return;

      const peer = new Peer({
        initiator: false,
        trickle: true,
        stream: userStream,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
      });

      peer.on("signal", (data) => {
        socketEmit("sendCallEvent", {
          chatId: currentCall.chatId._id,
          answer: JSON.stringify(data),
          participantId: participant.userId._id,
          saveToDb: data.type === "answer",
        });
        if (data.type === "candidate") {
          socketEmit("saveIceCandidates", {
            iceCandidates: JSON.stringify(data),
            chatId: currentCall.chatId._id,
            candidatesType: "answer",
            to: participant.userId._id,
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("track", (_, stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("close", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        peer.destroy();
      });

      peer.on("error", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        peer.destroy();
      });

      const participantOffer = participant.offers.find(
        (offer) => offer.to === userId
      );
      if (participantOffer?.sdp) {
        const parsedSignal: SignalData = JSON.parse(participantOffer.sdp);
        peer.signal(parsedSignal);
      }
      if (participantOffer?.iceCandidates) {
        participantOffer.iceCandidates.forEach((iceCandidate) => {
          const parsedCandidate: SignalData = JSON.parse(iceCandidate);
          peer.signal(parsedCandidate);
        });
      }

      get().actions.addConnection(participant.userId._id, peer);
    },
  },
}));

export const useConnectionsStoreActions = () =>
  useConnectionsStore((state) => state.actions);
