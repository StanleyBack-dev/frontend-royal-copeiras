import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuthenticatedRoute from "./features/auth/guards/RequireAuthenticatedRoute";
import { useAuthSession } from "./features/auth/context/AuthSessionContext";
import { renderAppShellRoutes } from "./router/routes/AppShellRoutes";
import { renderAuthRoutes } from "./router/routes/AuthRoutes";

export default function AppRouter() {
  const { session } = useAuthSession();
  const authenticatedUserId = session?.user.idUsers;

  return (
    <BrowserRouter>
      <Routes>
        {renderAuthRoutes()}

        <Route element={<RequireAuthenticatedRoute />}>
          {renderAppShellRoutes({ userId: authenticatedUserId })}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
