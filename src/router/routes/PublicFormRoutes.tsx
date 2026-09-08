import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { publicFormRoutePaths } from "../navigation";

const RequestBudget = lazy(() => import("../../pages/public/RequestBudget"));

function withPageSuspense(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando...</div>}>
      {element}
    </Suspense>
  );
}

/** Reachable without logging in — gated by the code, not by a session. */
export function PublicFormRoutes() {
  return (
    <Route
      path={publicFormRoutePaths.requestBudget}
      element={withPageSuspense(<RequestBudget />)}
    />
  );
}
