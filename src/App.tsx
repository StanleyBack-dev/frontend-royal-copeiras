import AppRouter from "./AppRouter";
import { AuthSessionProvider } from "./features/auth/context/AuthSessionContext";
import { ToastProvider } from "./shared/toast/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <AuthSessionProvider>
        <AppRouter />
      </AuthSessionProvider>
    </ToastProvider>
  );
}
