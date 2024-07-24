export interface User {
  _id: string;
  displayName: string;
  access_token: string;
  background?: string;
  avatarUrl?: string;
}

export interface UserState {
  user: User | null;
  actions: {
    setUser: (
      newValue:
        | User
        | ((prevUser: UserState["user"]) => UserState["user"])
        | null
    ) => void;
  };
}

export interface AppStore {
  isSocketConnected: boolean;
  actions: {
    setIsSocketConnected: (
      newValue:
        | boolean
        | ((
            prevValue: AppStore["isSocketConnected"]
          ) => AppStore["isSocketConnected"])
    ) => void;
  };
}
