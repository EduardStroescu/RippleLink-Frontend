import privateClient from "../privateClient";
import publicClient from "../publicClient";

const userEndpoints = {
  login: "auth/login",
  register: "auth/register",
  getUserInfo: "users/current-user",
  getUserByDisplayName: "users/search/displayName",
  passwordUpdate: "users/update-password",
  avatarUpdate: "users/change-avatar",
  accountUpdate: "users/update-details",
  logout: "auth/logout",
  //   googleLogin: "auth/login/google",
  //   facebookLogin: "auth/login/facebook",
};

const userApi = {
  signin: async ({ password, email }: { password: string; email: string }) => {
    try {
      const response = await publicClient.post(userEndpoints.login, {
        password,
        email,
      });

      return { response };
    } catch (error) {
      return { error };
    }
  },

  signup: async ({
    avatar,
    email,
    password,
    confirmPassword,
    displayName,
    firstName,
    lastName,
  }: {
    avatar: string;
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await publicClient.post(userEndpoints.register, {
        avatar,
        email,
        password,
        confirmPassword,
        displayName,
        firstName,
        lastName,
      });

      return { response };
    } catch (error) {
      return { error };
    }
  },

  getInfo: async () => {
    try {
      const response = await privateClient.get(userEndpoints.getUserInfo);
      return { response };
    } catch (error) {
      return { error };
    }
  },

  getUsersByDisplayName: async (displayName: string) => {
    try {
      const response = await privateClient.get(
        userEndpoints.getUserByDisplayName.replace("displayName", displayName)
      );

      return { response };
    } catch (error) {
      return { error };
    }
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
    try {
      const response = await privateClient.put(userEndpoints.passwordUpdate, {
        password,
        newPassword,
        confirmNewPassword,
      });

      return { response };
    } catch (error) {
      return { error };
    }
  },

  avatarUpdate: async ({ avatar }: { avatar: string }) => {
    try {
      const response = await privateClient.patch(userEndpoints.avatarUpdate, {
        avatar,
      });

      return { response };
    } catch (error) {
      return { error };
    }
  },

  accountUpdate: async ({ email }: { email: string }) => {
    try {
      const response = await privateClient.patch(userEndpoints.accountUpdate, {
        email,
      });

      return { response };
    } catch (error) {
      return { error };
    }
  },

  logout: async () => {
    try {
      const response = await privateClient.get(userEndpoints.logout);

      return { response };
    } catch (error) {
      return { error };
    }
  },
};

export default userApi;
