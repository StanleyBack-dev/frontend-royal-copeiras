import {
  AuthSessionResponseSchema,
  type AuthSessionResponse,
} from "../../../api/auth/schema";

const AUTH_SESSION_STORAGE_KEY = "royal_auth_session";

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
