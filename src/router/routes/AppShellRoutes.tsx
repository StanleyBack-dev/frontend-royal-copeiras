import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import AppLayout from "../AppLayout";
import { authRoutePaths, routePaths } from "../navigation";
import { ManagementRoutes } from "./ManagementRoutes";

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
      <Route
        path={routePaths.dashboard}
        element={withPageSuspense(<Dashboard />)}
      />
      {ManagementRoutes({ userId, loginPath: authRoutePaths.login })}
      <Route path={routePaths.events} element={withPageSuspense(<Events />)} />
      <Route
        path={routePaths.finances}
        element={withPageSuspense(<Finance />)}
      />
      <Route path={routePaths.debts} element={withPageSuspense(<Debts />)} />
      <Route
        path={routePaths.investments}
        element={withPageSuspense(<Investments />)}
      />
      <Route
        path={routePaths.profile}
        element={withPageSuspense(<Profile />)}
      />
      <Route
        path={routePaths.settings}
        element={withPageSuspense(<Settings />)}
      />
    </Route>
  );
}
