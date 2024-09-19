import { Socket } from "socket.io-client";
import { Call } from "./call";
import { Chat } from "./chat";
import { User } from "./user";
import Peer from "simple-peer";

export interface UserStore {
  user: User | null;

  actions: {
    setUser: (
      newValue:
        | User
        | ((prevUser: UserStore["user"]) => UserStore["user"])
        | null
    ) => void;
  };
}

export interface AppStore {
  socket: Socket | null;
  appBackground: string | undefined;
  appTint: string | undefined;
  appGlow: string | undefined;

  actions: {
    setSocket: (newSocket: Socket | null) => void;
    setAppBackground: (newBackground: AppStore["appBackground"]) => void;
    setAppTint: (newTint: AppStore["appTint"]) => void;
    setAppGlow: (newGlow: AppStore["appGlow"]) => void;
    resetAppStore: () => void;
  };
}

export interface StreamsStore {
  streams: {
    [key: string]: { stream: MediaStream | null; shouldDisplayPopUp?: boolean };
  };
  isUserSharingVideo: false | "video" | "screen";
  isUserMicrophoneMuted: boolean;
  selectedDevices: {
    audioInput?: MediaDeviceInfo;
    audioOutput?: MediaDeviceInfo;
    videoInput?: MediaDeviceInfo;
  };
  cameraOrientation: boolean;
  outputVolume: number;

  actions: {
    addStream: (participantId: User["_id"], stream: MediaStream) => void;
    removeStream: (participantId: User["_id"]) => void;
    toggleStreamPopUp: (participantId: User["_id"]) => void;
    setIsUserSharingVideo: (
      newState: StreamsStore["isUserSharingVideo"]
    ) => void;
    setIsUserMicrophoneMuted: (
      newState: StreamsStore["isUserMicrophoneMuted"]
    ) => void;
    setCameraOrientation: () => void;
    setSelectedDevices: (
      devices: Partial<StreamsStore["selectedDevices"]>
    ) => void;
    attachStreamToCall: (params?: {
      videoEnabled?: boolean;
      audioEnabled?: boolean;
      videoInputId?: MediaDeviceInfo["deviceId"];
      audioInputId?: MediaDeviceInfo["deviceId"];
      orientation?: boolean;
    }) => Promise<MediaStream | undefined>;
    handleVideoShare: () => void;
    handleScreenShare: () => void;
    handleSwitchCameraOrientation: () => void;
    handleSwitchDevice: (device: MediaDeviceInfo) => void;
    setOutputVolume: (newVolume: number) => void;
  };
}

export interface ConnectionsStore {
  connections: { [key: string]: Peer.Instance };

  actions: {
    addConnection: (participantId: User["_id"], peer: Peer.Instance) => void;
    removeConnection: (participantId: User["_id"]) => void;
    resetConnections: () => void;
    sendCallOffers: (
      participant: Call["participants"][number],
      currentCall: Call
    ) => void;
    sendCallAnswers: (
      participant: Call["participants"][number],
      currentCall: Call
    ) => void;
  };
}

export interface CallStore {
  currentCall: Call | null;
  incomingCalls: Call[] | [];
  recentlyEndedCalls: Call[] | [];
  joiningCall: Call["chatId"]["_id"] | null;

  actions: {
    setCurrentCall: (call: Call | null) => void;
    addIncomingCall: (call: Call) => void;
    removeIncomingCall: (chatId: Call["chatId"]["_id"]) => void;
    addRecentlyEndedCall: (call: Call) => void;
    removeRecentlyEndedCall: (chatId: Call["chatId"]["_id"]) => void;
    resetIncomingCalls: () => void;
    setJoiningCall: (chatId: Call["chatId"]["_id"] | null) => void;
    startCall: (chat: Chat, videoEnabled?: boolean) => Promise<void>;
    answerCall: (callDetails: Call, videoEnabled?: boolean) => Promise<void>;
    endCall: (call: Call) => void;
  };
}
