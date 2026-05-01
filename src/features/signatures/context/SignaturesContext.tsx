import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useSignatures } from "../hooks/useSignatures";

export type UseSignaturesResult = ReturnType<typeof useSignatures>;
export const SignaturesContext = createContext<UseSignaturesResult | null>(
  null,
);

interface SignaturesProviderProps {
  children: ReactNode;
}

export function SignaturesProvider({ children }: SignaturesProviderProps) {
  const signaturesState = useSignatures();

  return (
    <SignaturesContext.Provider value={signaturesState}>
      {children}
    </SignaturesContext.Provider>
  );
}

export function SignaturesProviderOutlet({ userId }: { userId?: string } = {}) {
  return (
    <SignaturesProvider userId={userId}>
      <Outlet />
    </SignaturesProvider>
  );
}
