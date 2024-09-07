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
  streams: {
    [key: string]: { stream: MediaStream | null; shouldDisplayPopUp?: boolean };
  };
  connections: { [key: string]: Peer.Instance };
  currentCall: Call | null;
  incomingCalls: Call[] | [];
  recentlyEndedCalls: Call[] | [];
  isUserSharingVideo: false | "video" | "screen";
  isUserMicrophoneMuted: boolean;
  joiningCall: Call["chatId"]["_id"] | null;

  actions: {
    addStream: (participantId: User["_id"], stream: MediaStream) => void;
    removeStream: (participantId: User["_id"]) => void;
    toggleStreamPopUp: (participantId: User["_id"]) => void;
    addConnection: (participantId: User["_id"], peer: Peer.Instance) => void;
    removeConnection: (participantId: User["_id"]) => void;
    resetConnections: () => void;
    setCurrentCall: (call: Call | null) => void;
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
