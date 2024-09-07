import { useUserStore } from "@/stores/useUserStore";
import axios, {
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosError,
} from "axios";
import queryString from "query-string";

const baseURL = import.meta.env.VITE_BACKEND_URL + "/api/";

const privateClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

let isRefreshing = false;
let failedQueue: Array<(token: string) => void> = [];

const processQueue = (_, token: string | null) => {
  failedQueue.forEach((callback) => token && callback(token));
  failedQueue = [];
};

privateClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = window.localStorage.getItem("user");
    if (!user) {
      return {
        ...config,
        headers: {
          "Content-Type": "application/json",
        } as AxiosRequestHeaders,
      };
    }

    const parsedUser = JSON.parse(user);
    const token = parsedUser?.access_token;

    config.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders;

    return config;
  },
  (error) => Promise.reject(error)
);

privateClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          failedQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(privateClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const user = window.localStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          const refreshToken = parsedUser.refresh_token;

          const response = await axios.post(`${baseURL}auth/refresh`, {
            refresh_token: refreshToken,
          });

          useUserStore.setState({ user: response.data });
          window.localStorage.setItem("user", JSON.stringify(response.data));
          isRefreshing = false;
          processQueue(null, response.data.access_token);

          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return privateClient(originalRequest);
        }
      } catch (error) {
        const refreshError = error as AxiosError;

        window.localStorage.removeItem("user");
        processQueue(refreshError, null);
        return Promise.reject(
          refreshError?.response?.data || "Token refresh failed"
        );
      }
    }

    return Promise.reject(
      error?.response?.data?.message || "An error occurred"
    );
  }
);

export default privateClient;
