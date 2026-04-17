import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSessionResponse } from "../../../api/auth/schema";
import { refreshSessionFromCookie } from "../services/auth.service";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  setStoredAuthSession,
} from "../utils/sessionStorage";

let bootstrapSessionPromise: Promise<AuthSessionResponse | null> | null = null;

function getBootstrapSessionPromise() {
  if (!bootstrapSessionPromise) {
    bootstrapSessionPromise = refreshSessionFromCookie();
  }

  return bootstrapSessionPromise;
}

interface AuthSessionContextValue {
  session: AuthSessionResponse | null;
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
  isInitializing: boolean;
  setSession: (session: AuthSessionResponse) => void;
  clearSession: () => void;
  markPasswordChanged: () => void;
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(
  null,
);

interface AuthSessionProviderProps {
  children: ReactNode;
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [session, setSessionState] = useState<AuthSessionResponse | null>(
    getStoredAuthSession(),
  );
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getBootstrapSessionPromise()
      .then((refreshedSession) => {
        if (cancelled) return;

        if (refreshedSession?.authenticated) {
          setSessionState(refreshedSession);
          setStoredAuthSession(refreshedSession);
          return;
        }

        setSessionState(null);
        clearStoredAuthSession();
      })
      .finally(() => {
        if (!cancelled) {
          setIsInitializing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((nextSession: AuthSessionResponse) => {
    setSessionState(nextSession);
    setStoredAuthSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    clearStoredAuthSession();
  }, []);

  const markPasswordChanged = useCallback(() => {
    setSessionState((current) => {
      if (!current) return current;

      const next = {
        ...current,
        mustChangePassword: false,
      };

      setStoredAuthSession(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.authenticated),
      requiresPasswordChange: Boolean(session?.mustChangePassword),
      isInitializing,
      setSession,
      clearSession,
      markPasswordChanged,
    }),
    [clearSession, isInitializing, markPasswordChanged, session, setSession],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}
