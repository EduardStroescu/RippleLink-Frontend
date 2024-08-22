import { Call } from "./call";
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
  appBackground: string | undefined;
  appTint: string | undefined;
  appGlow: string | undefined;

  actions: {
    setAppBackground: (newBackground: AppStore["appBackground"]) => void;
    setAppTint: (newTint: AppStore["appTint"]) => void;
    setAppGlow: (newGlow: AppStore["appGlow"]) => void;
    resetAppStore: () => void;
  };
}

export interface CallStore {
  streams: { [key: string]: MediaStream };
  connections: { [key: string]: Peer.Instance };
  currentCall: Call | null;
  answeredCall: boolean;
  incomingCalls: Call[] | [];
  recentlyEndedCalls: Call[] | [];
  isUserSharingVideo: false | "video" | "screen";
  isUserMicrophoneMuted: boolean;
  joiningCall: Call["chatId"]["_id"] | null;

  actions: {
    addStream: (participantId: string, stream: MediaStream) => void;
    removeStream: (participantId: string) => void;
    addConnection: (participantId: string, peer: Peer.Instance) => void;
    removeConnection: (participantId: string) => void;
    resetConnections: () => void;
    setCurrentCall: (call: Call | null) => void;
    setAnsweredCall: (newState: boolean) => void;
    addIncomingCall: (call: Call) => void;
    removeIncomingCall: (chatId: Call["chatId"]["_id"]) => void;
    addRecentlyEndedCall: (call: Call) => void;
    removeRecentlyEndedCall: (chatId: Call["chatId"]["_id"]) => void;
    resetIncomingCalls: () => void;
    setIsUserSharingVideo: (newState: CallStore["isUserSharingVideo"]) => void;
    setIsUserMicrophoneMuted: (
      newState: CallStore["isUserMicrophoneMuted"]
    ) => void;
    setJoiningCall: (chatId: Call["chatId"]["_id"] | null) => void;
  };
}
