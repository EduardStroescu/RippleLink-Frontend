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
  isDrawerOpen: boolean;
  isChatDetailsDrawerOpen: boolean;

  actions: {
    setIsDrawerOpen: (
      newValue:
        | boolean
        | ((prevUser: AppStore["isDrawerOpen"]) => AppStore["isDrawerOpen"])
    ) => void;
    setIsChatDetailsDrawerOpen: (
      newValue:
        | boolean
        | ((
            prevUser: AppStore["isChatDetailsDrawerOpen"]
          ) => AppStore["isChatDetailsDrawerOpen"])
    ) => void;
  };
}

export interface CallStore {
  streams: { [key: string]: MediaStream };
  connections: { [key: string]: Peer.Instance };
  currentCall: Chat["ongoingCall"] | null;
  answeredCall: boolean;
  // incomingCalls: Chat["ongoingCall"][] | [];

  actions: {
    addStream: (participantId: string, stream: MediaStream) => void;
    removeStream: (participantId: string) => void;
    addConnection: (participantId: string, peer: Peer.Instance) => void;
    removeConnection: (participantId: string) => void;
    resetConnections: () => void;
    setCurrentCall: (call: Chat["ongoingCall"] | null) => void;
    setAnsweredCall: (newState: boolean) => void;
    // setIncomingCalls: (
    //   newValue:
    //     | []
    //     | ((
    //         prevCalls: CallStore["incomingCalls"]
    //       ) => CallStore["incomingCalls"])
    // ) => void;
  };
}
