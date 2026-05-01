import { useContext } from "react";
import { EventsContext } from "./EventsContext";

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEventsContext deve ser usado dentro de EventsProvider");
  }
  return context;
}
