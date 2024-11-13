import { useCallback, useEffect, useRef } from "react";
import { useCallStore, useCallStoreActions } from "@/stores/useCallStore";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "@/stores/useUserStore";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/components/ui";
import { useStreamsStore } from "@/stores/useStreamsStore";
import {
  useConnectionsStore,
  useConnectionsStoreActions,
} from "@/stores/useConnectionsStore";

export const useCurrentCallState = () => {
  const socket = useAppStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const currentCall = useCallStore((state) => state.currentCall);
  const peerConnections = useConnectionsStore((state) => state.connections);
  const { streams, selectedDevices, outputVolume } = useStreamsStore(
    useShallow((state) => ({
      streams: state.streams,
      selectedDevices: state.selectedDevices,
      outputVolume: state.outputVolume,
    }))
  );

  const { endCall } = useCallStoreActions();
  const { sendCallAnswers, sendCallOffers } = useConnectionsStoreActions();

  const userId = user?._id;
  const audioTracksRef = useRef({});
  const { toast } = useToast();

  // Helper to get all users in the current call who have not yet connected
  const getOffersNotAnsweredTo = useCallback(() => {
    const peerConnections = useConnectionsStore.getState().connections;
    return currentCall?.participants.filter(
      (participant) =>
        participant.userId._id !== userId &&
        !peerConnections[participant.userId._id] &&
        participant?.offers?.some((offer) => offer.to === userId)
    );
  }, [currentCall?.participants, userId]);

  // Send answers to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall) return;

    const offersNotAnsweredTo = getOffersNotAnsweredTo();

    offersNotAnsweredTo?.forEach((participant) => {
      sendCallAnswers(participant, currentCall);
    });
  }, [currentCall, getOffersNotAnsweredTo, sendCallAnswers]);

  // Send requests to all users in current call who you are not connected to
  useEffect(() => {
    if (!currentCall || !userId) return;
    // Extract user IDs from the current call participants
    const currentCallParticipantIds = currentCall.participants.map(
      (participant) => participant.userId._id
    );

    // Filter users in the chat who are not the current user, have no connection, and are not in the current call participants
    const usersInCurrentCallWithoutAConnection = currentCall.chatId.users
      .filter(
        (participant) =>
          participant._id !== userId && // Exclude current user
          !peerConnections[participant._id] && // Exclude users with existing connections
          !currentCallParticipantIds.includes(participant._id) // Include only those who are not in the current call
      )
      .map((user) => ({
        userId: user, // Map to an object with the user ID
      }));

    usersInCurrentCallWithoutAConnection.forEach((participant) => {
      sendCallOffers(participant, currentCall);
    });
  }, [peerConnections, currentCall, sendCallOffers, userId]);

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
  }, [selectedDevices, toast]);

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

  // Create audio elements for each user in the current call, to be available globally
  useEffect(() => {
    if (!currentCall) return;

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
          audioTracksRef.current[userId]?.srcObject?.getAudioTracks()?.[0] ===
            audioTrack
        )
          return;

        const audioElement = new Audio();
        const audioOnlyStream = new MediaStream([audioTrack]);

        audioElement.srcObject = audioOnlyStream;
        audioElement.autoplay = true;
        audioElement.volume = 1;

        audioTracksRef.current[userId] = audioElement;
        audioElement.play().catch((error) => {
          console.error("Error playing the audio stream:", error);
        });
      } else if (!stream && audioTracksRef.current[userId]) {
        const audioElement = audioTracksRef.current[userId];
        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          delete audioTracksRef.current[userId];
        }
      }
    });
  }, [currentCall, streams, userId]);

  // Cleanup each audio elements  when the component unmounts
  useEffect(() => {
    const cleanupAudioTracks = () => {
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
  }, []);

  // Force end call when the component unmounts
  useEffect(() => {
    if (!socket || !currentCall) return;

    const handleBeforeUnload = () => endCall(currentCall);

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, endCall, currentCall]);
};
