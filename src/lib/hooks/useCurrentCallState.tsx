import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { toast } from "@/components/ui/use-toast";
import { useAppStore } from "@/stores/useAppStore";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import {
  useConnectionsStore,
  useConnectionsStoreActions,
} from "@/stores/useConnectionsStore";
import { useStreamsStore } from "@/stores/useStreamsStore";
import { useUserStore } from "@/stores/useUserStore";

export const useCurrentCallState = () => {
  const socket = useAppStore((state) => state.socket);
  const user = useUserStore((state) => state.user);

  const currentCall = useCallStore((state) => state.currentCall);
  const { endCall } = useCallStoreActions();

  const peerConnections = useConnectionsStore((state) => state.connections);
  const { sendCallAnswers, sendCallOffers } = useConnectionsStoreActions();

  const { streams, selectedDevices, outputVolume } = useStreamsStore(
    useShallow((state) => ({
      streams: state.streams,
      selectedDevices: state.selectedDevices,
      outputVolume: state.outputVolume,
    }))
  );

  const userId = user?._id;
  const audioTracksRef = useRef<{ [userId: string]: HTMLAudioElement | null }>(
    {}
  );

  // Signal on other participants' events
  useEffect(() => {
    if (!socket || !currentCall || !userId) return;
    socket.on(
      "callEvent",
      (data: { message: string; participantId: string }) => {
        const parsedSignal = JSON.parse(data.message);
        peerConnections[data.participantId]?.signal(parsedSignal);
      }
    );

    return () => {
      socket.off("callEvent");
    };
  }, [currentCall, peerConnections, socket, userId]);

  // Send answers to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall) return;
    const peerConnections = useConnectionsStore.getState().connections;

    const offersNotAnsweredTo = currentCall?.participants.filter(
      (participant) =>
        participant.userId._id !== userId &&
        participant?.offers?.some((offer) => offer.to === userId) &&
        participant.status === "inCall" &&
        !peerConnections[participant.userId._id]
    );

    offersNotAnsweredTo?.forEach((participant) => {
      sendCallAnswers(participant, currentCall);
    });
  }, [currentCall, sendCallAnswers, userId]);

  // Send requests to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !userId) return;

    // Filter users in the chat who are not the current user, have no connection, and are not in the current call participants
    const usersInCurrentCallWithoutAConnection =
      currentCall.participants.filter(
        (participant) =>
          participant.userId._id !== userId && // Exclude current user
          !participant?.offers?.some((offer) => offer.to === userId) &&
          !peerConnections[participant.userId._id] // Exclude users with existing connections
      );

    usersInCurrentCallWithoutAConnection.forEach((participant) => {
      sendCallOffers(participant, currentCall);
    });
  }, [peerConnections, currentCall, sendCallOffers, userId]);

  // Create audio elements for each user in the current call, to be available globally
  useEffect(() => {
    // Get state directly from  the store as not to trigger the effect unnecesarily
    const currentCall = useCallStore.getState().currentCall;
    const userId = useUserStore.getState().user?._id;
    if (!currentCall || !userId) return;

    const currentParticipants = currentCall.participants.filter(
      (participant) => participant.userId._id !== userId
    );

    currentParticipants.forEach((participant) => {
      const userId = participant.userId._id;
      const stream = streams[userId]?.stream;

      if (stream) {
        const audioTrack = stream.getAudioTracks()?.[0];
        if (
          !audioTrack ||
          (
            audioTracksRef.current[userId]?.srcObject as MediaStream | null
          )?.getAudioTracks()?.[0] === audioTrack
        )
          return;

        const audioElement = new Audio();
        const audioOnlyStream = new MediaStream([audioTrack]);

        audioElement.srcObject = audioOnlyStream;
        audioElement.autoplay = true;
        audioElement.volume = 1;

        audioElement.play().catch((_) => undefined);
        audioTracksRef.current[userId] = audioElement;
      } else if (!stream && audioTracksRef.current[userId]) {
        const audioElement = audioTracksRef.current[userId];
        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          delete audioTracksRef.current[userId];
        }
      }
    });

    const cleanupAudioTracks = () => {
      if (Object.values(streams)?.length) return;
      Object.keys(audioTracksRef.current).forEach((userId) => {
        const audioElement = audioTracksRef.current[userId];
        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          delete audioTracksRef.current[userId];
        }
      });
    };

    return cleanupAudioTracks;
  }, [streams]);

  // Switch output device according to selected device from state
  useEffect(() => {
    const switchOutputDevice = async (deviceId: string) => {
      // Iterate over audio elements and attempt to set sink ID
      const audioElements = Object.values(audioTracksRef.current);

      for (const audioElement of audioElements) {
        if (audioElement instanceof HTMLAudioElement) {
          try {
            await audioElement.setSinkId(deviceId);
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error accessing audio device.",
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Could not set audio device. Please try again.",
          });
        }
      }
    };
    if (selectedDevices.audioOutput) {
      switchOutputDevice(selectedDevices.audioOutput.deviceId);
    }
  }, [selectedDevices]);

  // Adjust volume according to state
  useEffect(() => {
    const handleAdjustVolume = (volume: number) => {
      Object.values(audioTracksRef.current).forEach((audioElement) => {
        if (audioElement instanceof HTMLAudioElement) {
          audioElement.volume = volume;
        }
      });
    };

    handleAdjustVolume(outputVolume);
  }, [outputVolume]);

  // Force end call when the component unmounts - user navigates away from the /chat/
  useEffect(() => {
    if (!socket || !currentCall) return;

    const handleBeforeUnload = () => endCall(currentCall);

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, endCall, currentCall]);
};
