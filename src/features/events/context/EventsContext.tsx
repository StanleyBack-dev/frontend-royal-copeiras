import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";

export type UseEventsResult = ReturnType<typeof useEvents>;
export const EventsContext = createContext<UseEventsResult | null>(null);

interface EventsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function EventsProvider({ children, userId }: EventsProviderProps) {
  void userId;
  const eventsState = useEvents();

  return (
    <EventsContext.Provider value={eventsState}>
      {children}
    </EventsContext.Provider>
  );
}

export function EventsProviderOutlet({ userId }: { userId?: string } = {}) {
  return (
    <EventsProvider userId={userId}>
      <Outlet />
    </EventsProvider>
  );
}
