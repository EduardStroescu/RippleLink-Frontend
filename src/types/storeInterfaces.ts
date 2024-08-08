import { User } from "./user";

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
  incomingCalls: User[];
  answeredCall: boolean;

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
    setIncomingCalls: (
      newValue:
        | []
        | User[]
        | ((prevCalls: AppStore["incomingCalls"]) => AppStore["incomingCalls"])
    ) => void;
    setAnsweredCall: (
      newValue:
        | boolean
        | ((prevCalls: AppStore["answeredCall"]) => AppStore["answeredCall"])
    ) => void;
  };
}
