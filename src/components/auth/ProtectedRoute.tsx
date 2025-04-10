
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.role && location.pathname !== "/onboarding") {
    // Redirect to onboarding if role is not set
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return (
    <DashboardLayout>
      {children || <Outlet />}
    </DashboardLayout>
  );
};

export default ProtectedRoute;
