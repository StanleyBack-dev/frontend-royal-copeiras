import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useUsers, type UseUsersResult } from "../../../hooks/users/useUsers";

export const UsersContext = createContext<UseUsersResult | null>(null);

interface UsersProviderProps {
  userId: string;
  children: ReactNode;
}

export function UsersProvider({ userId, children }: UsersProviderProps) {
  const usersState = useUsers(userId);

  return (
    <UsersContext.Provider value={usersState}>{children}</UsersContext.Provider>
  );
}

export function UsersProviderOutlet({ userId }: { userId: string }) {
  return (
    <UsersProvider userId={userId}>
      <Outlet />
    </UsersProvider>
  );
}
