import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authRoutePaths } from "../../../router/navigation";
import { useAuthSession } from "../context/useAuthSession";

export default function RequireAuthenticatedRoute() {
  const location = useLocation();
  const { isAuthenticated, requiresPasswordChange, isInitializing } =
    useAuthSession();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={authRoutePaths.login} replace state={{ from: location }} />
    );
  }

  if (
    requiresPasswordChange &&
    location.pathname !== authRoutePaths.firstAccessChangePassword
  ) {
    return <Navigate to={authRoutePaths.firstAccessChangePassword} replace />;
  }

  return <Outlet />;
}
