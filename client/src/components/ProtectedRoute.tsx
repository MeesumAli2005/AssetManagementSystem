import { Navigate, Outlet } from "react-router-dom";
import { ROLES, type Role } from "../constants";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: Role[];
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === ROLES.ADMINISTRATOR ? "/admin" : "/employee"}
        replace
      />
    );
  }

  return <Outlet />;
}
