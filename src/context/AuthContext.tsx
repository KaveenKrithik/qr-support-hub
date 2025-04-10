
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// These types would be used with Supabase, adding them now for structure
export type UserProfile = {
  id: string;
  email: string;
  role: "student" | "admin" | "superadmin" | null;
  name: string | null;
  department: string | null;
  duties?: string | null;
  qualifications?: string | null;
  created_at?: string;
};

export type AuthContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // This would be replaced with actual Supabase auth listener
  useEffect(() => {
    const checkUser = async () => {
      // Mock checking for authenticated user in localStorage
      const savedUser = localStorage.getItem("srmUser");
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      setIsLoading(false);
    };

    checkUser();
  }, []);

  // Mock sign in with magic link - would be replaced with actual Supabase auth
  const signInWithMagicLink = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Email validation - ensure it ends with @srmist.edu.in
      if (!email.endsWith("@srmist.edu.in")) {
        toast({
          title: "Invalid email domain",
          description: "Please use your SRM Institute email (@srmist.edu.in)",
          variant: "destructive",
        });
        return;
      }
      
      // Mock success
      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link",
      });
      
      // For demo purposes, we'll simulate a successful login after 2 seconds
      setTimeout(() => {
        // Create mock user
        const mockUser: UserProfile = {
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          role: null, // New users won't have a role yet
          name: null,
          department: null,
        };
        
        // Save to localStorage for persistence
        localStorage.setItem("srmUser", JSON.stringify(mockUser));
        setUser(mockUser);
        
        // Redirect to onboarding if role is not set
        if (!mockUser.role) {
          navigate("/onboarding");
        } else {
          // Navigate based on role
          navigate(`/dashboard/${mockUser.role}`);
        }
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Mock sign out
      localStorage.removeItem("srmUser");
      setUser(null);
      navigate("/login");
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      
      // Mock updating the user profile
      const updatedUser = { ...user, ...data };
      localStorage.setItem("srmUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithMagicLink,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
