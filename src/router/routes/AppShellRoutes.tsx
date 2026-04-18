import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import AppLayout from "../AppLayout";
import { authRoutePaths, routePaths, utilityRoutePaths } from "../navigation";
import RequirePageAccessRoute from "../../features/auth/guards/RequirePageAccessRoute";
import { ManagementRoutes } from "./ManagementRoutes";

const AccessDenied = lazy(() => import("../../pages/AccessDenied"));
const Dashboard = lazy(() => import("../../pages/Dashboard"));
const Debts = lazy(() => import("../../pages/Debts"));
const Events = lazy(() => import("../../pages/Events"));
const Finance = lazy(() => import("../../pages/Finance"));
const Investments = lazy(() => import("../../pages/Investments"));
const Profile = lazy(() => import("../../pages/Profile"));
const Settings = lazy(() => import("../../pages/Settings"));

function withPageSuspense(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando...</div>}>
      {element}
    </Suspense>
  );
}

interface AppShellRoutesProps {
  userId?: string;
}

export function AppShellRoutes({ userId }: AppShellRoutesProps) {
  return (
    <Route element={<AppLayout />}>
      <Route element={<RequirePageAccessRoute view="dashboard" />}>
        <Route
          path={routePaths.dashboard}
          element={withPageSuspense(<Dashboard />)}
        />
      </Route>
      {ManagementRoutes({ userId, loginPath: authRoutePaths.login })}
      <Route element={<RequirePageAccessRoute view="events" />}>
        <Route
          path={routePaths.events}
          element={withPageSuspense(<Events />)}
        />
      </Route>
      <Route element={<RequirePageAccessRoute view="finances" />}>
        <Route
          path={routePaths.finances}
          element={withPageSuspense(<Finance />)}
        />
      </Route>
      <Route element={<RequirePageAccessRoute view="debts" />}>
        <Route path={routePaths.debts} element={withPageSuspense(<Debts />)} />
      </Route>
      <Route element={<RequirePageAccessRoute view="investments" />}>
        <Route
          path={routePaths.investments}
          element={withPageSuspense(<Investments />)}
        />
      </Route>
      <Route
        path={routePaths.profile}
        element={withPageSuspense(<Profile />)}
      />
      <Route
        path={routePaths.settings}
        element={withPageSuspense(<Settings />)}
      />
      <Route
        path={utilityRoutePaths.accessDenied}
        element={withPageSuspense(<AccessDenied />)}
      />
    </Route>
  );
}
