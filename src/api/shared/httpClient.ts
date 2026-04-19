import axios from "axios";
import {
  clearStoredAuthSession,
  clearStoredPagePermissions,
} from "../../features/auth/utils/sessionStorage";

export const httpClient = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<void> | null = null;
let redirectingToLogin = false;

function clearAuthStateAndRedirect() {
  if (redirectingToLogin) {
    return;
  }

  redirectingToLogin = true;
  clearStoredAuthSession();
  clearStoredPagePermissions();

  if (typeof window !== "undefined") {
    window.location.replace("/");
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const statusCode = error.response?.status;
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint =
      typeof originalRequest?.url === "string" &&
      ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"].some(
        (path) => originalRequest.url?.includes(path),
      );

    if (
      statusCode !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      if (statusCode === 401 && isAuthEndpoint) {
        clearAuthStateAndRedirect();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = (async () => {
          try {
            await axios.post(
              "/api/auth/refresh",
              {},
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          } finally {
            refreshRequest = null;
          }
        })();
      }

      await refreshRequest;
      return httpClient(originalRequest);
    } catch (refreshError) {
      clearAuthStateAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);
