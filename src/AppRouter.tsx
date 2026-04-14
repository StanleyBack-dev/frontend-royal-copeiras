import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/customers/Customers.tsx";
import CustomerForm from "./pages/customers/CustomerForm.tsx";
import { CustomersProviderOutlet } from "./features/customers";
import { AppLayout, customerRoutePaths, routePaths } from "./router";
import Events from "./pages/Events";
import Finance from "./pages/Finance";
import Debts from "./pages/Debts";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={customerRoutePaths.list} replace />} />
          <Route path={routePaths.dashboard} element={<Dashboard />} />
          <Route element={<CustomersProviderOutlet userId="mock-user-id" />}>
            <Route path={customerRoutePaths.list} element={<Customers />} />
            <Route
              path={customerRoutePaths.create}
              element={<CustomerForm mode="create" />}
            />
            <Route
              path={customerRoutePaths.edit()}
              element={<CustomerForm mode="edit" />}
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
          <Route path={routePaths.events} element={<Events />} />
          <Route path={routePaths.finances} element={<Finance />} />
          <Route path={routePaths.debts} element={<Debts />} />
          <Route path={routePaths.investments} element={<Investments />} />
          <Route path={routePaths.profile} element={<Profile />} />
          <Route path={routePaths.settings} element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
