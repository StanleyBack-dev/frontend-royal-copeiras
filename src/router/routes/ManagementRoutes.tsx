import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { Navigate, Route } from "react-router-dom";
import { CustomersProviderOutlet } from "../../features/customers";
import { EmployeesProviderOutlet } from "../../features/employees";
import { UsersProviderOutlet } from "../../features/users";
import {
  customerRoutePaths,
  employeeRoutePaths,
  userRoutePaths,
} from "../navigation";

const CustomerForm = lazy(() => import("../../pages/customers/CustomerForm"));
const Customers = lazy(() => import("../../pages/customers/Customers"));
const EmployeeForm = lazy(() => import("../../pages/employees/EmployeeForm"));
const Employees = lazy(() => import("../../pages/employees/Employees"));
const UserForm = lazy(() => import("../../pages/users/UserForm"));
const Users = lazy(() => import("../../pages/users/Users"));

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

interface ManagementRoutesProps {
  userId?: string;
  loginPath: string;
}

export function renderManagementRoutes({
  userId,
  loginPath,
}: ManagementRoutesProps) {
  return (
    <>
      <Route
        element={
          <UserScopedProviderRoute
            userId={userId}
            loginPath={loginPath}
            ProviderOutlet={CustomersProviderOutlet}
          />
        }
      >
        <Route
          path={customerRoutePaths.list}
          element={withPageSuspense(<Customers />)}
        />
        <Route
          path={customerRoutePaths.create}
          element={withPageSuspense(<CustomerForm mode="create" />)}
        />
        <Route
          path={customerRoutePaths.edit()}
          element={withPageSuspense(<CustomerForm mode="edit" />)}
        />
      </Route>
      <Route
        path={customerRoutePaths.legacyList}
        element={<Navigate to={customerRoutePaths.list} replace />}
      />
      <Route
        path={customerRoutePaths.legacyCreate}
        element={<Navigate to={customerRoutePaths.create} replace />}
      />
      <Route
        path={customerRoutePaths.legacyEdit()}
        element={<Navigate to={customerRoutePaths.edit()} replace />}
      />

      <Route
        element={
          <UserScopedProviderRoute
            userId={userId}
            loginPath={loginPath}
            ProviderOutlet={EmployeesProviderOutlet}
          />
        }
      >
        <Route
          path={employeeRoutePaths.list}
          element={withPageSuspense(<Employees />)}
        />
        <Route
          path={employeeRoutePaths.create}
          element={withPageSuspense(<EmployeeForm mode="create" />)}
        />
        <Route
          path={employeeRoutePaths.edit()}
          element={withPageSuspense(<EmployeeForm mode="edit" />)}
        />
      </Route>
      <Route
        path={employeeRoutePaths.legacyList}
        element={<Navigate to={employeeRoutePaths.list} replace />}
      />
      <Route
        path={employeeRoutePaths.legacyCreate}
        element={<Navigate to={employeeRoutePaths.create} replace />}
      />
      <Route
        path={employeeRoutePaths.legacyEdit()}
        element={<Navigate to={employeeRoutePaths.edit()} replace />}
      />

      <Route
        element={
          <UserScopedProviderRoute
            userId={userId}
            loginPath={loginPath}
            ProviderOutlet={UsersProviderOutlet}
          />
        }
      >
        <Route
          path={userRoutePaths.list}
          element={withPageSuspense(<Users />)}
        />
        <Route
          path={userRoutePaths.create}
          element={withPageSuspense(<UserForm mode="create" />)}
        />
        <Route
          path={userRoutePaths.edit()}
          element={withPageSuspense(<UserForm mode="edit" />)}
        />
      </Route>
      <Route
        path={userRoutePaths.legacyList}
        element={<Navigate to={userRoutePaths.list} replace />}
      />
      <Route
        path={userRoutePaths.legacyCreate}
        element={<Navigate to={userRoutePaths.create} replace />}
      />
      <Route
        path={userRoutePaths.legacyEdit()}
        element={<Navigate to={userRoutePaths.edit()} replace />}
      />
    </>
  );
}
