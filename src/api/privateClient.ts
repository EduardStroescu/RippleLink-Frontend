import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import queryString from "query-string";

import { useUserStore } from "@/stores/useUserStore";

const baseURL = import.meta.env.VITE_BACKEND_URL + "/api/";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
interface CustomAxiosError extends AxiosError<{ message: string }> {
  config: CustomAxiosRequestConfig;
}

interface PrivateClient extends AxiosInstance {
  refreshToken: () => Promise<void>;
  isRefreshingToken: boolean;
}

const privateClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
}) as PrivateClient;

privateClient.isRefreshingToken = false;
let failedQueue: Array<(token: string) => void> = [];

const processQueue = (token: string | null) => {
  if (token) {
    failedQueue.forEach((callback) => callback(token));
  } else {
    failedQueue.forEach((callback) => callback("")); // Handle failed refresh queue
  }
  failedQueue = [];
};

privateClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = window.localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      const token = parsedUser?.access_token;

      if (token) {
        config.headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
      }
    }
    return config;
  },
  (error: AxiosError<{ message: string }>) => Promise.reject(error)
);

privateClient.interceptors.response.use(
  (response) => response.data,
  async (error: CustomAxiosError) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (privateClient.isRefreshingToken) {
        return new Promise((resolve, reject) => {
          failedQueue.push((token: string) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(privateClient(originalRequest));
            } else {
              reject(new Error("Invalid session. Please log in again!"));
            }
          });
        });
      }

      privateClient.isRefreshingToken = true;

      try {
        const user = window.localStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          const refreshToken = parsedUser.refresh_token;

          const response = await axios.post(`${baseURL}auth/refresh`, {
            refresh_token: refreshToken,
          });

          useUserStore.getState().actions.setUser(response.data);

          privateClient.isRefreshingToken = false;
          processQueue(response.data.access_token);

          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return privateClient(originalRequest);
        }
      } catch (error) {
        const refreshError = error as AxiosError<{ message: string }>;

        useUserStore.getState().actions.removeUser();
        privateClient.isRefreshingToken = false;
        processQueue(null);

        // Redirect to home page with the original URL
        window.location.href =
          "/?redirect=" + encodeURIComponent(window.location.href);

        return Promise.reject(
          refreshError?.response?.data.message ||
            "Invalid session. Please log in again!"
        );
      }
    }

    return Promise.reject(
      error?.response?.data.message ||
        "An unexpected error occurred. Please try again later!"
    );
  }
);

export default privateClient;
