import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";
import queryString from "query-string";

const baseURL = import.meta.env.VITE_BACKEND_URL + "/api/";

const publicClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

publicClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    return {
      ...config,
      headers: {
        "Content-Type": "application/json",
      } as AxiosRequestHeaders,
      withCredentials: true,
    };
  }
);

publicClient.interceptors.response.use(
  (response) => response.data,
  (err) => Promise.reject(err?.response?.data?.message || "An error occurred")
);

export default publicClient;
