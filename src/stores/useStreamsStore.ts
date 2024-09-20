import { toast } from "@/components/ui/use-toast";
import { audioConstraints, videoConstraints } from "@/lib/const";
import { StreamsStore } from "@/types";
import { create } from "zustand";
import { useUserStore } from "./useUserStore";
import { useConnectionsStore } from "./useConnectionsStore";

const getStreamsStoreState = () => useStreamsStore.getState();
const getConnectionsStoreState = () => useConnectionsStore.getState();
const getUserStoreState = () => useUserStore.getState();

export const useStreamsStore = create<StreamsStore>((set, get) => ({
  streams: {},
  isUserSharingVideo: false,
  isUserMicrophoneMuted: false,
  cameraOrientation: false,
  selectedDevices: {
    audioInput: undefined,
    audioOutput: undefined,
    videoInput: undefined,
  },
  outputVolume: 1,

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
        if (newStreams[id]?.stream) {
          newStreams[id].stream.getTracks().forEach((track) => {
            track.stop();
            newStreams[id].stream?.removeTrack(track);
          });
          newStreams[id].stream = null;
        }
        return { streams: newStreams };
      }),
    toggleStreamPopUp: (id) =>
      set((state) => {
        const newStreams = { ...state.streams };
        newStreams[id].shouldDisplayPopUp = !newStreams[id].shouldDisplayPopUp;
        return { streams: newStreams };
      }),
    setIsUserSharingVideo: (newState) =>
      set(() => ({ isUserSharingVideo: newState })),
    setIsUserMicrophoneMuted: (newState) =>
      set(() => ({ isUserMicrophoneMuted: newState })),
    setCameraOrientation: () =>
      set((state) => ({
        cameraOrientation: !state.cameraOrientation,
      })),
    setSelectedDevices: (updatedDevices) =>
      set((state) => ({
        selectedDevices: { ...state.selectedDevices, ...updatedDevices },
      })),
    attachStreamToCall: async ({
      videoEnabled = false,
      audioEnabled = false,
      videoInputId = get().selectedDevices?.videoInput?.deviceId,
      audioInputId = get().selectedDevices?.audioInput?.deviceId,
      orientation = get().cameraOrientation,
    } = {}) => {
      try {
        const includeVideoContraints = videoConstraints;
        const includeAudioConstraints = audioConstraints;
        if (videoEnabled && videoInputId) {
          includeVideoContraints.deviceId = { exact: videoInputId };
        }
        if (audioEnabled && audioInputId) {
          includeAudioConstraints.deviceId = { exact: audioInputId };
        }
        includeVideoContraints.facingMode = !orientation
          ? "user"
          : "environment";

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled ? includeVideoContraints : false,
          audio: audioEnabled ? includeAudioConstraints : false,
        });
        if (audioEnabled && get().isUserMicrophoneMuted)
          stream.getAudioTracks()[0].enabled = false;
        if (videoEnabled) get().actions.setIsUserSharingVideo("video");

        return stream;
      } catch (error) {
        if (error instanceof DOMException && error.message.includes("video")) {
          toast({
            variant: "destructive",
            title: "Error accessing camera.",
            description: (error as { message: string }).message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to access the media devices.",
          });
        }
      }
    },
    handleVideoShare: async () => {
      try {
        const userId = getUserStoreState().user?._id;

        if (!userId) return;
        const { streams } = getStreamsStoreState();
        const { connections } = getConnectionsStoreState();
        const userStream = streams[userId].stream;
        const peerConnections = connections;

        const oldStream = userStream;
        if (userStream?.getVideoTracks().length === 0) {
          // Start video sharing
          const newStream = await get().actions.attachStreamToCall({
            videoEnabled: true,
          });
          if (!newStream || !oldStream) return;

          // Add the new video track to the peer
          Object.values(peerConnections).forEach((peer) => {
            peer.addTrack(newStream.getVideoTracks()[0], oldStream);
          });

          oldStream.addTrack(newStream.getVideoTracks()[0]);
          newStream.removeTrack(newStream.getVideoTracks()[0]);
          // Update local stream and state
          get().actions.addStream(userId, oldStream);
          get().actions.setIsUserSharingVideo("video");
        } else {
          // Stop current video stream and create a new audio-only one
          const newStream = await get().actions.attachStreamToCall({
            audioEnabled: true,
          });

          if (!newStream || !oldStream) return;

          // Remove existing streams
          Object.values(peerConnections).forEach((peer) => {
            peer.removeStream(oldStream);

            // Add new stream
            peer.addStream(newStream);
          });

          // Stop video tracks from the current stream
          oldStream?.getTracks().forEach((track) => {
            track.stop();
            oldStream?.removeTrack(track);
          });

          // Update local stream and state
          get().actions.addStream(userId, newStream);
          get().actions.setIsUserSharingVideo(false);
        }
      } catch (error) {
        if (error instanceof DOMException) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
      }
    },
    handleScreenShare: async () => {
      try {
        const userId = getUserStoreState().user?._id;

        if (!userId) return;
        const { streams } = getStreamsStoreState();
        const { connections } = getConnectionsStoreState();
        const userStream = streams[userId].stream;
        const peerConnections = connections;

        const oldStream = userStream;
        if (userStream?.getVideoTracks().length === 0) {
          // Start screen sharing
          const newStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              frameRate: { ideal: 60, max: 60 },
              height: { ideal: 1080, max: 2160 },
              width: { ideal: 1920, max: 3840 },
            },
            audio: false,
          });

          if (!newStream || !oldStream) return;

          oldStream.addTrack(newStream.getVideoTracks()[0]);

          // Add the new video track to the peer
          Object.values(peerConnections).forEach((peer) => {
            peer.addTrack(oldStream.getVideoTracks()[0], oldStream);
          });

          newStream.removeTrack(newStream.getVideoTracks()[0]);
          // Update local stream and state
          get().actions.addStream(userId, oldStream);
          get().actions.setIsUserSharingVideo("screen");
        } else {
          // Stop current video stream and create a new audio-only one
          const newStream = await get().actions.attachStreamToCall({
            audioEnabled: true,
          });

          if (!newStream || !oldStream) return;

          // Remove existing streams
          Object.values(peerConnections).forEach((peer) => {
            peer.removeStream(oldStream);

            // Add new stream
            peer.addStream(newStream);
          });

          // Stop video tracks from the current stream
          oldStream?.getTracks().forEach((track) => {
            track.stop();
            oldStream.removeTrack(track);
          });

          // Update local stream and state
          get().actions.addStream(userId, newStream);
          get().actions.setIsUserSharingVideo(false);
        }
      } catch (error) {
        if (error instanceof DOMException) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
      }
    },
    handleSwitchCameraOrientation: async () => {
      const userId = getUserStoreState().user?._id;

      if (!userId) return;
      const { streams } = getStreamsStoreState();
      const { connections } = getConnectionsStoreState();
      const userStream = streams[userId].stream;
      const peerConnections = connections;
      get().actions.setCameraOrientation();

      const oldStream = userStream;
      // Stop existing video tracks before switching
      oldStream?.getVideoTracks().forEach((track) => track.stop());

      const newStream = await get().actions.attachStreamToCall({
        videoEnabled: true,
      });

      if (!newStream || !oldStream || !userId) return;

      // Replace video track in the peer connection
      Object.values(peerConnections).forEach((peer) => {
        peer.replaceTrack(
          oldStream.getVideoTracks()[0],
          newStream.getVideoTracks()[0],
          oldStream
        );
      });

      // Add new track to the local stream
      oldStream
        .getVideoTracks()
        .forEach((track) => oldStream.removeTrack(track));
      oldStream.addTrack(newStream.getVideoTracks()[0]);

      get().actions.addStream(userId, oldStream);
    },
    handleSwitchDevice: async (device) => {
      const userId = getUserStoreState().user?._id;
      if (!userId) return;
      const { connections } = getConnectionsStoreState();
      const peerConnections = connections;
      const userStream = get().streams[userId].stream;

      if (device.kind === "audioinput") {
        const newStream = await get().actions.attachStreamToCall({
          audioEnabled: true,
          audioInputId: device.deviceId,
        });
        const peerStream = userStream;
        if (!newStream || !peerStream) return;

        const oldAudioTrack = peerStream.getAudioTracks()[0];
        Object.values(peerConnections).forEach((peer) => {
          if (!oldAudioTrack) return;
          peer.replaceTrack(
            oldAudioTrack,
            newStream.getAudioTracks()[0],
            peerStream
          );
        });

        if (oldAudioTrack && userId) {
          oldAudioTrack.stop();
          peerStream.removeTrack(oldAudioTrack);
          peerStream.addTrack(newStream.getAudioTracks()[0]);
          get().actions.addStream(userId, peerStream);
        }
        get().actions.setSelectedDevices({
          audioInput: device,
        });
      } else if (device.kind === "videoinput") {
        if (userStream?.getVideoTracks().length === 0) {
          const newStream = await get().actions.attachStreamToCall({
            videoEnabled: true,
            videoInputId: device.deviceId,
          });
          const peerStream = userStream;

          if (!newStream || !peerStream) return;

          const oldVideoTrack = peerStream.getVideoTracks()[0];
          Object.values(peerConnections).forEach((peer) => {
            if (oldVideoTrack) return;
            peer.replaceTrack(
              oldVideoTrack,
              newStream.getVideoTracks()[0],
              peerStream
            );
          });

          if (oldVideoTrack && userId) {
            oldVideoTrack.stop();
            peerStream.removeTrack(oldVideoTrack);
            peerStream.addTrack(newStream.getVideoTracks()[0]);
            get().actions.addStream(userId, peerStream);
          }
        }
        get().actions.setSelectedDevices({
          videoInput: device,
        });
      } else if (device.kind === "audiooutput") {
        get().actions.setSelectedDevices({
          audioOutput: device,
        });
      }
    },
    setOutputVolume: (newVolume) => set(() => ({ outputVolume: newVolume })),
  },
}));

export const useStreamsStoreActions = () =>
  useStreamsStore((state) => state.actions);
