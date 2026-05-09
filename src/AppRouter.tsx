import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  RequireAuthorizationRoute,
  requireActiveUserPolicy,
} from "./features/auth";
import RequireAuthenticatedRoute from "./features/auth/guards/RequireAuthenticatedRoute";
import { useAuthSession } from "./features/auth/context/useAuthSession";
import { AppShellRoutes } from "./router/routes/AppShellRoutes";
import { AuthRoutes } from "./router/routes/AuthRoutes";
import SplashScreen from "./pages/SplashScreen";

export default function AppRouter() {
  const { session, isInitializing } = useAuthSession();
  const authenticatedUserId = session?.user.idUsers;

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {AuthRoutes()}

        <Route element={<RequireAuthenticatedRoute />}>
          <Route
            element={
              <RequireAuthorizationRoute
                policy={requireActiveUserPolicy}
                deniedState={{ reasonCode: "USER_INACTIVE" }}
              />
            }
          >
            {AppShellRoutes({ userId: authenticatedUserId })}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
