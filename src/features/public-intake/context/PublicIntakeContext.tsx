import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { usePublicIntakeCodes } from "../hooks/usePublicIntakeCodes";

export type UsePublicIntakeCodesResult = ReturnType<
  typeof usePublicIntakeCodes
>;
export const PublicIntakeContext =
  createContext<UsePublicIntakeCodesResult | null>(null);

interface PublicIntakeProviderProps {
  children: ReactNode;
  userId?: string;
}

export function PublicIntakeProvider({
  children,
  userId,
}: PublicIntakeProviderProps) {
  void userId;
  const state = usePublicIntakeCodes();

  return (
    <PublicIntakeContext.Provider value={state}>
      {children}
    </PublicIntakeContext.Provider>
  );
}

export function PublicIntakeProviderOutlet({
  userId,
}: { userId?: string } = {}) {
  return (
    <PublicIntakeProvider userId={userId}>
      <Outlet />
    </PublicIntakeProvider>
  );
}
