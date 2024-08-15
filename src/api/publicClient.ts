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
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (err) => {
    throw err.response.data;
  }
);

export default publicClient;
