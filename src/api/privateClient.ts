import axios from "axios";
import queryString from "query-string";

const baseURL = import.meta.env.VITE_BACKEND_URL + "api/";

const privateClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

privateClient.interceptors.request.use(async (config) => {
  const user = window.localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const token = parsedUser?.access_token;
  return {
    ...config,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
});

privateClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 Unauthorized
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = window.localStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          const token = parsedUser.refresh_token;

          // Attempt to refresh the access token
          const response = await axios.get(`${baseURL}auth/refresh`, {
            params: {
              refresh_token: token,
            },
          });

          window.localStorage.setItem("user", JSON.stringify(response.data));

          // Retry the original request
          return await privateClient(originalRequest);
        }
      } catch (refreshError) {
        // The refresh token is invalid or expired
        // Removing the user from local storage will trigger a redirect to the login page
        // localStorage.removeItem("user");
        return Promise.reject(refreshError?.response?.data?.message);
      }
    }
    return Promise.reject(error?.response?.data?.message);
  }
);

export default privateClient;
