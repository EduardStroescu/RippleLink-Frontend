import { ConnectionsStore } from "@/types";
import { create } from "zustand";
import Peer, { SignalData } from "simple-peer";
import { useStreamsStore } from "./useStreamsStore";
import { useAppStore } from "./useAppStore";
import { useUserStore } from "./useUserStore";

const getStreamsStoreActions = () => useStreamsStore.getState().actions;
const getStreamsStoreState = () => useStreamsStore.getState();
const getAppStoreState = () => useAppStore.getState();
const getUserStoreState = () => useUserStore.getState();

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
    sendCallOffers: (participant, currentCall) => {
      const userId = getUserStoreState().user?._id;
      const { socket } = getAppStoreState();
      const { streams } = getStreamsStoreState();
      const { addStream, removeStream } = getStreamsStoreActions();

      if (!userId || !socket) return;
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
        if (data.type === "offer") {
          socket.emit("initiateCall", {
            chatId: currentCall.chatId._id,
            offer: JSON.stringify(data),
            participantId: participant.userId._id,
            saveToDb: true,
          });
        } else {
          if (data.type === "candidate") {
            socket.emit("saveIceCandidates", {
              iceCandidates: JSON.stringify(data),
              chatId: currentCall.chatId._id,
              candidatesType: "offer",
              to: participant.userId._id,
            });
          }
          socket.emit("initiateCall", {
            chatId: currentCall.chatId._id,
            offer: JSON.stringify(data),
            participantId: participant.userId._id,
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("track", (_, stream) => {
        addStream(participant.userId._id, stream);
      });

      socket.on(
        "callAnswered",
        (data: { answer: string; participantId: string }) => {
          if (participant.userId._id === data.participantId) {
            const parsedSignal = JSON.parse(data.answer);
            peer.signal(parsedSignal);
          }
        }
      );

      peer.on("close", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        socket.off("callAnswered");
        peer.destroy();
      });

      peer.on("error", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        socket.off("callAnswered");
        peer.destroy();
      });

      get().actions.addConnection(participant.userId._id, peer);
    },
    sendCallAnswers: (participant, currentCall) => {
      const userId = getUserStoreState().user?._id;
      const { socket } = getAppStoreState();
      const { streams } = getStreamsStoreState();
      const { addStream, removeStream } = getStreamsStoreActions();

      if (!userId || !socket) return;

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
        if (!participant.userId._id || !currentCall) return;
        if (data.type === "answer") {
          socket.emit("sendCallAnswer", {
            chatId: currentCall.chatId._id,
            answer: JSON.stringify(data),
            participantId: participant.userId._id,
            saveToDb: true,
          });
        } else {
          if (data.type === "candidate") {
            socket.emit("saveIceCandidates", {
              iceCandidates: JSON.stringify(data),
              chatId: currentCall.chatId._id,
              candidatesType: "answer",
              to: participant.userId._id,
            });
          }
          socket.emit("sendCallAnswer", {
            chatId: currentCall.chatId._id,
            answer: JSON.stringify(data),
            participantId: participant.userId._id,
          });
        }
      });

      peer.on("stream", (stream) => {
        addStream(participant.userId._id, stream);
      });

      peer.on("track", (_, stream) => {
        addStream(participant.userId._id, stream);
      });

      socket.on(
        "callCreated",
        (data: { offer: string; participantId: string }) => {
          if (participant.userId._id === data.participantId) {
            const parsedSignal = JSON.parse(data.offer);
            peer.signal(parsedSignal);
          }
        }
      );

      peer.on("close", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        socket.off("callCreated");
        peer.destroy();
      });

      peer.on("error", () => {
        removeStream(participant.userId._id);
        get().actions.removeConnection(participant.userId._id);
        socket.off("callCreated");
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
