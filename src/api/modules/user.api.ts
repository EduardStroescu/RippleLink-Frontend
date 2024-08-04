import { User } from "@/types/user";
import privateClient from "../privateClient";
import publicClient from "../publicClient";

const userEndpoints = {
  login: "auth/login",
  register: "auth/register",
  getUserInfo: "users/current-user",
  getUserByDisplayName: "users/search/:displayName",
  getUserById: "users/:id",
  passwordUpdate: "users/update-password",
  avatarUpdate: "users/change-avatar",
  accountUpdate: "users/update-details",
  logout: "auth/logout",
  //   googleLogin: "auth/login/google",
  //   facebookLogin: "auth/login/facebook",
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

  getUsersById: async (userId: string): Promise<User[] | []> => {
    return await privateClient.get(
      userEndpoints.getUserById.replace(":id", userId)
    );
  },

  getUsersByDisplayName: async (displayName: string): Promise<User[] | []> => {
    return await privateClient.get(
      userEndpoints.getUserByDisplayName.replace(":displayName", displayName)
    );
  },

  passwordUpdate: async ({
    password,
    newPassword,
    confirmNewPassword,
  }: {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    return await privateClient.put(userEndpoints.passwordUpdate, {
      password,
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

  accountUpdate: async ({ email }: { email: string }): Promise<User> => {
    return await privateClient.patch(userEndpoints.accountUpdate, {
      email,
    });
  },

  logout: async (): Promise<{ success: string }> => {
    return await privateClient.get(userEndpoints.logout);
  },
};

export default userApi;
