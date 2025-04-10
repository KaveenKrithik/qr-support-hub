
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";

const Index = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to landing page
        navigate("/");
      } else if (!user?.role) {
        // Authenticated but no role, redirect to onboarding
        navigate("/onboarding");
      } else {
        // Authenticated with role, redirect to appropriate dashboard
        navigate(`/dashboard/${user.role}`);
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);
  
  // Show loading indicator while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <h1 className="text-2xl font-bold mt-4">Loading...</h1>
        <p className="text-muted-foreground mt-2">Setting up your dashboard</p>
      </div>
    </div>
  );
};

export default Index;
