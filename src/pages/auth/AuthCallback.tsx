import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [processingAuth, setProcessingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        
        if (accessToken) {
          // If we have an access token in the URL, set the session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });
          
          // Remove the hash from URL to avoid issues on refresh
          window.history.replaceState(null, "", window.location.pathname);
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
      } finally {
        // When auth state is determined, set processing to false
        if (!isLoading) {
          // Wait a moment to ensure auth state is fully processed
          const timer = setTimeout(() => {
            setProcessingAuth(false);
          }, 1000);
          
          // eslint-disable-next-line no-unsafe-finally
          return () => clearTimeout(timer);
        }
      }
    };

    handleCallback();
  }, [isLoading]);

  // While still processing, show loading
  if (isLoading || processingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <h1 className="text-2xl font-bold mt-4">Authenticating...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect based on role
  if (isAuthenticated) {
    if (!user?.role) {
      // User needs to complete onboarding
      return <Navigate to="/onboarding" replace />;
    } else {
      // Redirect to the appropriate dashboard based on role
      return <Navigate to={`/dashboard/${user.role}`} replace />;
    }
  } else {
    // Not authenticated - redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default AuthCallback;