import AppRouter from "./AppRouter";
import { ToastProvider } from "./shared/toast/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}
