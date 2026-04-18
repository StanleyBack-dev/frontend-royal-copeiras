import {
  AuthSessionResponseSchema,
  type AuthSessionResponse,
} from "../../../api/auth/schema";
import type { PageAccessKey } from "../../../api/users/schema";

const AUTH_SESSION_STORAGE_KEY = "royal_auth_session";
const AUTH_PAGE_PERMISSIONS_STORAGE_KEY = "royal_auth_page_permissions";

export function getStoredAuthSession(): AuthSessionResponse | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsedJson = JSON.parse(raw) as unknown;
    const parsed = AuthSessionResponseSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function setStoredAuthSession(session: AuthSessionResponse): void {
  sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function getStoredPagePermissions(): PageAccessKey[] {
  try {
    const raw = sessionStorage.getItem(AUTH_PAGE_PERMISSIONS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === "string") as PageAccessKey[];
  } catch {
    return [];
  }
}

export function setStoredPagePermissions(
  pagePermissions: PageAccessKey[],
): void {
  sessionStorage.setItem(
    AUTH_PAGE_PERMISSIONS_STORAGE_KEY,
    JSON.stringify(pagePermissions),
  );
}

export function clearStoredPagePermissions(): void {
  sessionStorage.removeItem(AUTH_PAGE_PERMISSIONS_STORAGE_KEY);
}
