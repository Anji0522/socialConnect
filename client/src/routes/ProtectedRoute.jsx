import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
