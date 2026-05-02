import axios from "axios";
import {
  clearStoredAuthSession,
  clearStoredPagePermissions,
} from "../../features/auth/utils/sessionStorage";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

function buildApiUrl(path: string): string {
  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const httpClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  try {
    if (config && config.headers) {
      delete config.headers["x-user-id"];
      delete config.headers["X-User-Id"];
    }
  } catch (e) {
    void e;
  }

  return config;
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
              buildApiUrl("/api/auth/refresh"),
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
