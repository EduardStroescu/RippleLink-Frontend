import privateClient from "@/api/privateClient";
import publicClient from "@/api/publicClient";
import { Settings } from "@/types/settings";
import { Status } from "@/types/status";
import { PublicUser, User } from "@/types/user";

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

export const userApi = {
  login: async ({
    password,
    email,
  }: {
    password: string;
    email: User["email"];
  }): Promise<User> =>
    await publicClient.post(userEndpoints.login, {
      password,
      email,
    }),
  register: async ({
    avatarUrl,
    email,
    password,
    confirmPassword,
    displayName,
    firstName,
    lastName,
  }: {
    avatarUrl: User["avatarUrl"];
    email: User["email"];
    password: string;
    confirmPassword: string;
    displayName?: User["displayName"];
    firstName: User["firstName"];
    lastName: User["lastName"];
  }): Promise<User> =>
    await publicClient.post(userEndpoints.register, {
      avatarUrl,
      email,
      password,
      confirmPassword,
      displayName,
      firstName,
      lastName,
    }),
  getInfo: async (): Promise<User> =>
    await privateClient.get(userEndpoints.getUserInfo),
  getUsersById: async (userId: PublicUser["_id"]): Promise<PublicUser> =>
    await privateClient.get(userEndpoints.getUserById.replace(":id", userId)),
  getUsersByDisplayName: async (
    displayName: PublicUser["displayName"]
  ): Promise<PublicUser[] | []> =>
    await privateClient.get(
      userEndpoints.getUserByDisplayName.replace(":displayName", displayName)
    ),
  changePassword: async ({
    currentPassword,
    newPassword,
    confirmNewPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    await privateClient.patch(userEndpoints.changePassword, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    }),
  avatarUpdate: async ({
    avatar,
  }: {
    avatar: string;
  }): Promise<{ avatarUrl: User["avatarUrl"] }> =>
    await privateClient.patch(userEndpoints.avatarUpdate, {
      avatar,
    }),
  accountUpdate: async ({
    email,
    displayName,
    firstName,
    lastName,
  }: {
    email?: User["email"];
    displayName?: User["displayName"];
    firstName?: User["firstName"];
    lastName?: User["lastName"];
  }): Promise<User> =>
    await privateClient.patch(userEndpoints.accountUpdate, {
      email,
      displayName,
      firstName,
      lastName,
    }),
  logout: async (): Promise<{ success: string }> =>
    await privateClient.get(userEndpoints.logout),
  deleteAccount: async ({
    currentPassword,
    confirmCurrentPassword,
  }: {
    currentPassword: string;
    confirmCurrentPassword: string;
  }): Promise<{ success: string }> =>
    await privateClient.request({
      method: "DELETE",
      url: userEndpoints.deleteAccount,
      data: {
        currentPassword,
        confirmCurrentPassword,
      },
    }),
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
  }): Promise<Settings> =>
    await privateClient.patch(userEndpoints.settingsUpdate, {
      backgroundImage,
      glowColor,
      tintColor,
      receiveNotifications,
    }),
  statusUpdate: async ({
    statusMessage,
  }: {
    statusMessage: Status["statusMessage"];
  }): Promise<Status> =>
    await privateClient.patch(userEndpoints.statusUpdate, {
      statusMessage,
    }),
};
