import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSessionResponse } from "../../../api/auth/schema";
import type { PageAccessKey } from "../../../api/users/schema";
import type { ActiveView } from "../../../types/views";
import {
  loadMyPagePermissions,
  refreshSessionFromCookie,
} from "../services/auth.service";
import {
  getGroupDefaultPagePermissions,
  hasPageAccess,
} from "../model/page-access";
import {
  clearStoredPagePermissions,
  clearStoredAuthSession,
  getStoredPagePermissions,
  getStoredAuthSession,
  setStoredPagePermissions,
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
  pagePermissions: PageAccessKey[];
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
  isInitializing: boolean;
  setSession: (session: AuthSessionResponse) => void;
  clearSession: () => void;
  markPasswordChanged: () => void;
  hasPageAccess: (view: ActiveView) => boolean;
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
  const [pagePermissions, setPagePermissions] = useState<PageAccessKey[]>(
    getStoredPagePermissions(),
  );
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getBootstrapSessionPromise()
      .then((refreshedSession) => {
        if (cancelled) return;

        if (refreshedSession?.authenticated) {
          const defaultPermissions = getGroupDefaultPagePermissions(
            refreshedSession.user.group,
          );

          setSessionState(refreshedSession);
          setStoredAuthSession(refreshedSession);

          setPagePermissions(defaultPermissions);
          setStoredPagePermissions(defaultPermissions);

          void loadMyPagePermissions(refreshedSession.user.idUsers)
            .then((permissions) => {
              if (cancelled) return;
              setPagePermissions(permissions);
              setStoredPagePermissions(permissions);
            })
            .catch(() => {
              // Keep group defaults as best-effort fallback.
            });

          return;
        }

        setSessionState(null);
        setPagePermissions([]);
        clearStoredAuthSession();
        clearStoredPagePermissions();
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

    const defaultPermissions = getGroupDefaultPagePermissions(
      nextSession.user.group,
    );
    setPagePermissions(defaultPermissions);
    setStoredPagePermissions(defaultPermissions);

    void loadMyPagePermissions(nextSession.user.idUsers)
      .then((permissions) => {
        setPagePermissions(permissions);
        setStoredPagePermissions(permissions);
      })
      .catch(() => {
        // Keep group defaults as best-effort fallback.
      });
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    setPagePermissions([]);
    clearStoredAuthSession();
    clearStoredPagePermissions();
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
      pagePermissions,
      requiresPasswordChange: Boolean(session?.mustChangePassword),
      isInitializing,
      setSession,
      clearSession,
      markPasswordChanged,
      hasPageAccess: (view) => hasPageAccess(view, pagePermissions),
    }),
    [
      clearSession,
      isInitializing,
      markPasswordChanged,
      pagePermissions,
      session,
      setSession,
    ],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}
