import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { Navigate, Route } from "react-router-dom";
import AppLayout from "../AppLayout";
import {
  authRoutePaths,
  budgetRoutePaths,
  contractRoutePaths,
  leadRoutePaths,
  routePaths,
  utilityRoutePaths,
} from "../navigation";
import RequirePageAccessRoute from "../../features/auth/guards/RequirePageAccessRoute";
import { BudgetsProviderOutlet } from "../../features/budgets";
import { ContractsProviderOutlet } from "../../features/contracts";
import { LeadsProviderOutlet } from "../../features/leads";
import { ManagementRoutes } from "./ManagementRoutes";

const AccessDenied = lazy(() => import("../../pages/AccessDenied"));
const Dashboard = lazy(() => import("../../pages/Dashboard"));
const Debts = lazy(() => import("../../pages/Debts"));
const BudgetForm = lazy(() => import("../../pages/budgets/BudgetForm"));
const Budgets = lazy(() => import("../../pages/budgets/Budgets"));
const ContractForm = lazy(() => import("../../pages/contracts/ContractForm"));
const Contracts = lazy(() => import("../../pages/contracts/Contracts"));
const Events = lazy(() => import("../../pages/Events"));
const Finance = lazy(() => import("../../pages/Finance"));
const Investments = lazy(() => import("../../pages/Investments"));
const LeadForm = lazy(() => import("../../pages/leads/LeadForm"));
const Leads = lazy(() => import("../../pages/leads/Leads"));
const Profile = lazy(() => import("../../pages/Profile"));
const Settings = lazy(() => import("../../pages/Settings"));

function withPageSuspense(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando...</div>}>
      {element}
    </Suspense>
  );
}

interface UserScopedProviderRouteProps {
  userId?: string;
  loginPath: string;
  ProviderOutlet: ComponentType<{ userId: string }>;
}

function UserScopedProviderRoute({
  userId,
  loginPath,
  ProviderOutlet,
}: UserScopedProviderRouteProps) {
  if (!userId) {
    return <Navigate to={loginPath} replace />;
  }

  return <ProviderOutlet userId={userId} />;
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
      <Route element={<RequirePageAccessRoute view="leads" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={LeadsProviderOutlet}
            />
          }
        >
          <Route
            path={leadRoutePaths.list}
            element={withPageSuspense(<Leads />)}
          />
          <Route
            path={leadRoutePaths.create}
            element={withPageSuspense(<LeadForm mode="create" />)}
          />
          <Route
            path={leadRoutePaths.edit()}
            element={withPageSuspense(<LeadForm mode="edit" />)}
          />
        </Route>
      </Route>
      <Route
        path={leadRoutePaths.legacyList}
        element={<Navigate to={leadRoutePaths.list} replace />}
      />
      <Route
        path={leadRoutePaths.legacyCreate}
        element={<Navigate to={leadRoutePaths.create} replace />}
      />
      <Route
        path={leadRoutePaths.legacyEdit()}
        element={<Navigate to={leadRoutePaths.edit()} replace />}
      />
      <Route element={<RequirePageAccessRoute view="budgets" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={BudgetsProviderOutlet}
            />
          }
        >
          <Route
            path={budgetRoutePaths.list}
            element={withPageSuspense(<Budgets />)}
          />
          <Route
            path={budgetRoutePaths.create}
            element={withPageSuspense(<BudgetForm mode="create" />)}
          />
          <Route
            path={budgetRoutePaths.edit()}
            element={withPageSuspense(<BudgetForm mode="edit" />)}
          />
        </Route>
      </Route>
      <Route
        path={budgetRoutePaths.legacyList}
        element={<Navigate to={budgetRoutePaths.list} replace />}
      />
      <Route
        path={budgetRoutePaths.legacyCreate}
        element={<Navigate to={budgetRoutePaths.create} replace />}
      />
      <Route
        path={budgetRoutePaths.legacyEdit()}
        element={<Navigate to={budgetRoutePaths.edit()} replace />}
      />
      <Route element={<RequirePageAccessRoute view="contracts" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={ContractsProviderOutlet}
            />
          }
        >
          <Route
            path={contractRoutePaths.list}
            element={withPageSuspense(<Contracts />)}
          />
          <Route
            path={contractRoutePaths.create}
            element={withPageSuspense(<ContractForm mode="create" />)}
          />
          <Route
            path={contractRoutePaths.edit()}
            element={withPageSuspense(<ContractForm mode="edit" />)}
          />
        </Route>
      </Route>
      <Route
        path={contractRoutePaths.legacyList}
        element={<Navigate to={contractRoutePaths.list} replace />}
      />
      <Route
        path={contractRoutePaths.legacyCreate}
        element={<Navigate to={contractRoutePaths.create} replace />}
      />
      <Route
        path={contractRoutePaths.legacyEdit()}
        element={<Navigate to={contractRoutePaths.edit()} replace />}
      />
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
