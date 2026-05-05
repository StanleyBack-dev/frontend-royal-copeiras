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
  clearStoredAuthSession,
  clearStoredPagePermissions,
  setStoredAuthSession,
  setStoredPagePermissions,
} from "../utils/sessionStorage";
import { subscribeAuthSessionEvents } from "../utils/auth-session-events";

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
  const [session, setSessionState] = useState<AuthSessionResponse | null>(null);
  const [pagePermissions, setPagePermissions] = useState<PageAccessKey[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySession = useCallback((nextSession: AuthSessionResponse) => {
    const defaultPermissions = getGroupDefaultPagePermissions(
      nextSession.user.group,
    );

    setSessionState(nextSession);
    setStoredAuthSession(nextSession);
    setPagePermissions([]);
    clearStoredPagePermissions();
    setIsInitializing(true);

    void loadMyPagePermissions()
      .then((permissions) => {
        setPagePermissions(permissions);
        setStoredPagePermissions(permissions);
      })
      .catch(() => {
        setPagePermissions(defaultPermissions);
        setStoredPagePermissions(defaultPermissions);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    setPagePermissions([]);
    clearStoredAuthSession();
    clearStoredPagePermissions();
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setIsInitializing(true);

    refreshSessionFromCookie()
      .then((refreshedSession) => {
        if (cancelled) return;

        if (refreshedSession?.authenticated) {
          applySession(refreshedSession);

          return;
        }

        clearSession();
      })
      .catch(() => {
        if (!cancelled) {
          clearSession();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  useEffect(() => {
    return subscribeAuthSessionEvents((event) => {
      if (event.type === "refreshed") {
        applySession(event.session);
        return;
      }

      clearSession();
    });
  }, [applySession, clearSession]);

  useEffect(() => {}, [pagePermissions]);

  const setSession = useCallback(
    (nextSession: AuthSessionResponse) => {
      applySession(nextSession);
    },
    [applySession],
  );

  const markPasswordChanged = useCallback(() => {
    setSessionState((current) => {
      if (!current) return current;

      return {
        ...current,
        mustChangePassword: false,
      };
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
