
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  isAuthenticated: boolean;
  user: Profile | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, name: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*, departments:department_id (name)')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching user profile:', error);
                setUser(null);
              } else if (data) {
                // Transform the data to include department name directly
                const profileData: Profile = {
                  ...data,
                  department: data.departments?.name
                };
                setUser(profileData);
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Fetch user profile
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*, departments:department_id (name)')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching user profile:', error);
              setUser(null);
            } else if (data) {
              // Transform the data to include department name directly
              const profileData: Profile = {
                ...data,
                department: data.departments?.name
              };
              setUser(profileData);
            }
          } catch (error) {
            console.error('Error in profile fetch:', error);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validateSrmEmail = (email: string): boolean => {
    return email.endsWith('@srmist.edu.in');
  };

  const signIn = async (email: string) => {
    try {
      if (!validateSrmEmail(email)) {
        throw new Error('Only SRM Institute emails (@srmist.edu.in) are allowed');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Magic link sent",
        description: "Check your email for the login link"
      });
      
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message
      });
      throw error;
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      if (!validateSrmEmail(email)) {
        throw new Error('Only SRM Institute emails (@srmist.edu.in) are allowed');
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully"
      });
      
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: "destructive",
        title: "Error verifying OTP",
        description: error.message
      });
      throw error;
    }
  };

  const signUp = async (email: string, name: string) => {
    try {
      if (!validateSrmEmail(email)) {
        throw new Error('Only SRM Institute emails (@srmist.edu.in) are allowed');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name
          }
        }
      });
      
      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link"
      });
      
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You have been logged out successfully"
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
      throw error;
    }
  };
  
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user,
        isLoading,
        signIn,
        signUp,
        verifyOTP,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
