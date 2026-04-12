import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextProps {
  notify: (message: string, type?: NotificationType) => void;
}

export const NotificationContext = createContext<
  NotificationContextProps | undefined
>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};

let notificationId = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(
    (message: string, type: NotificationType = "info") => {
      const id = ++notificationId;
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3500);
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 items-end">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`min-w-[220px] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 animate-fade-in-up
              ${n.type === "success" ? "bg-green-100 text-green-800 border border-green-300" : ""}
              ${n.type === "error" ? "bg-red-100 text-red-800 border border-red-300" : ""}
              ${n.type === "warning" ? "bg-yellow-100 text-yellow-900 border border-yellow-300" : ""}
              ${n.type === "info" ? "bg-[#f5ede8] text-[#7a4430] border border-[#e8d5c9]" : ""}
            `}
            style={{ boxShadow: "0 2px 16px 0 #e8d5c9" }}
          >
            {n.type === "success" && (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="#22c55e" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {n.type === "error" && (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                <path stroke="#ef4444" strokeWidth="2" d="M8 8l8 8M16 8l-8 8" />
              </svg>
            )}
            {n.type === "warning" && (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="#eab308" strokeWidth="2" d="M12 8v4m0 4h.01" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#eab308"
                  strokeWidth="2"
                />
              </svg>
            )}
            {n.type === "info" && (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#c9a227"
                  strokeWidth="2"
                />
                <path stroke="#c9a227" strokeWidth="2" d="M12 8v4m0 4h.01" />
              </svg>
            )}
            <span>{n.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
