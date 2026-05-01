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
  const [session, setSessionState] = useState<AuthSessionResponse | null>(null);
  // Start with empty permissions on app boot to avoid stale stored values
  const [pagePermissions, setPagePermissions] = useState<PageAccessKey[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setIsInitializing(true);

    getBootstrapSessionPromise()
      .then((refreshedSession) => {
        if (cancelled) return;

        if (refreshedSession?.authenticated) {
          const defaultPermissions = getGroupDefaultPagePermissions(
            refreshedSession.user.group,
          );

          setSessionState(refreshedSession);

          // Start with empty permissions until backend returns effectivePermissions
          setPagePermissions([]);

          void loadMyPagePermissions(refreshedSession.user.idUsers)
            .then((permissions) => {
              if (cancelled) return;
              setPagePermissions(permissions);
            })
            .catch(() => {
              if (cancelled) return;
              // On failure, fall back to group defaults
              setPagePermissions(defaultPermissions);
            })
            .finally(() => {
              if (!cancelled) setIsInitializing(false);
            });

          return;
        }

        setSessionState(null);
        setPagePermissions([]);
        setIsInitializing(false);
      })
      .catch(() => {
        if (!cancelled) setIsInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // debug hook removed for security
  }, [pagePermissions]);

  const setSession = useCallback((nextSession: AuthSessionResponse) => {
    setSessionState(nextSession);

    const defaultPermissions = getGroupDefaultPagePermissions(
      nextSession.user.group,
    );

    // Do not apply defaults immediately; start empty until backend responds
    setPagePermissions([]);
    setIsInitializing(true);

    void loadMyPagePermissions(nextSession.user.idUsers)
      .then((permissions) => {
        setPagePermissions(permissions);
      })
      .catch(() => {
        // On failure, fall back to group defaults
        setPagePermissions(defaultPermissions);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    setPagePermissions([]);
  }, []);

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
