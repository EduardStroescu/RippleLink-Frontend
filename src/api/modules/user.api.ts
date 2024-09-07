import { User } from "@/types/user";
import privateClient from "../privateClient";
import publicClient from "../publicClient";
import { Settings } from "@/types/settings";
import { Status } from "@/types/status";

const userEndpoints = {
  login: "auth/login",
  register: "auth/register",
  getUserInfo: "users/current-user",
  getUserByDisplayName: "users/search/:displayName",
  getUserById: "users/:id",
  changePassword: "users/update-password",
  avatarUpdate: "users/change-avatar",
  accountUpdate: "users/update-details",
  settingsUpdate: "settings",
  deleteAccount: "users",
  statusUpdate: "status",
  logout: "auth/logout",
};

const userApi = {
  login: async ({
    password,
    email,
  }: {
    password: string;
    email: string;
  }): Promise<User> => {
    return await publicClient.post(userEndpoints.login, {
      password,
      email,
    });
  },

  register: async ({
    avatarUrl,
    email,
    password,
    confirmPassword,
    displayName,
    firstName,
    lastName,
  }: {
    avatarUrl: string;
    email: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
    firstName: string;
    lastName: string;
  }): Promise<User> => {
    return await publicClient.post(userEndpoints.register, {
      avatarUrl,
      email,
      password,
      confirmPassword,
      displayName,
      firstName,
      lastName,
    });
  },

  getInfo: async (): Promise<User> => {
    return await privateClient.get(userEndpoints.getUserInfo);
  },

  getUsersById: async (userId: string): Promise<User> => {
    return await privateClient.get(
      userEndpoints.getUserById.replace(":id", userId)
    );
  },

  getUsersByDisplayName: async (displayName: string): Promise<User[] | []> => {
    return await privateClient.get(
      userEndpoints.getUserByDisplayName.replace(":displayName", displayName)
    );
  },

  changePassword: async ({
    currentPassword,
    newPassword,
    confirmNewPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    return await privateClient.patch(userEndpoints.changePassword, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  },

  avatarUpdate: async ({
    avatar,
  }: {
    avatar: string;
  }): Promise<{ avatarUrl: string }> => {
    return await privateClient.patch(userEndpoints.avatarUpdate, {
      avatar,
    });
  },

  accountUpdate: async ({
    email,
    displayName,
    firstName,
    lastName,
  }: {
    email?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> => {
    return await privateClient.patch(userEndpoints.accountUpdate, {
      email,
      displayName,
      firstName,
      lastName,
    });
  },

  logout: async (): Promise<{ success: string }> => {
    return await privateClient.get(userEndpoints.logout);
  },

  deleteAccount: async ({
    currentPassword,
    confirmCurrentPassword,
  }: {
    currentPassword: string;
    confirmCurrentPassword: string;
  }): Promise<{ success: string }> => {
    return await privateClient.request({
      method: "DELETE",
      url: userEndpoints.deleteAccount,
      data: {
        currentPassword,
        confirmCurrentPassword,
      },
    });
  },

  updateSettings: async ({
    backgroundImage,
    glowColor,
    tintColor,
    receiveNotifications,
  }: {
    backgroundImage?: string;
    glowColor?: string;
    tintColor?: string;
    receiveNotifications?: boolean;
  }): Promise<Settings> => {
    return await privateClient.patch(userEndpoints.settingsUpdate, {
      backgroundImage,
      glowColor,
      tintColor,
      receiveNotifications,
    });
  },

  statusUpdate: async ({
    statusMessage,
  }: {
    statusMessage: string;
  }): Promise<Status> => {
    return await privateClient.patch(userEndpoints.statusUpdate, {
      statusMessage,
    });
  },
};

export default userApi;
