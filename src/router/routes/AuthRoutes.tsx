import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import RequireAuthenticatedRoute from "../../features/auth/guards/RequireAuthenticatedRoute";
import RequirePasswordChangeRoute from "../../features/auth/guards/RequirePasswordChangeRoute";
import { authRoutePaths } from "../navigation";

const Login = lazy(() => import("../../pages/Login"));
const FirstAccessChangePassword = lazy(
  () => import("../../pages/FirstAccessChangePassword"),
);

function withPageSuspense(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando...</div>}>
      {element}
    </Suspense>
  );
}

export function AuthRoutes() {
  return (
    <>
      <Route
        path={authRoutePaths.login}
        element={withPageSuspense(<Login />)}
      />

      <Route element={<RequireAuthenticatedRoute />}>
        <Route element={<RequirePasswordChangeRoute />}>
          <Route
            path={authRoutePaths.firstAccessChangePassword}
            element={withPageSuspense(<FirstAccessChangePassword />)}
          />
        </Route>
      </Route>
    </>
  );
}
