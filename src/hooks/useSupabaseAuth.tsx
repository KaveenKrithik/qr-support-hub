import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Profile as BaseProfile } from '@/types';

type Profile = BaseProfile & {
  isNewUser?: boolean;
};
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  isAuthenticated: boolean;
  user: Profile | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);

  // Helper function to fetch or create user profile
  const fetchOrCreateProfile = async (authUser: User, userData?: { name?: string }) => {
    try {
      // First, try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*, departments:department_id (name)')
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no profile exists
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError.message);
      }
      
      // If profile exists, use it
      if (existingProfile) {
        const profileData: Profile = {
          ...existingProfile,
          department: existingProfile.departments?.name
        };
        setUser(profileData);
        return;
      }
      
      // If no profile exists, create one
      if (!existingProfile) {
        // Create a new profile using available information
        const newProfile = {
          id: authUser.id,
          email: authUser.email || '',
          name: userData?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: 'student' as const, // Default role
          created_at: new Date().toISOString()
        };
        
        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select('*')
            .single();
          
          if (createError) {
            console.error('Error creating new user profile:', createError);
            // Fall back to operating with unauthenticated profile
            // This allows the user to continue, though they'll need to complete onboarding again later
            setUser({...newProfile, isNewUser: true});
            
            toast({
              title: "Profile creation issue",
              description: "Your profile couldn't be saved automatically. You may need to set up your profile again later.",
              variant: "destructive"
            });
          } else if (createdProfile) {
            setUser(createdProfile as Profile);
          }
        } catch (error) {
          console.error('Profile creation error:', error);
        }
      }
    } catch (error) {
      console.error('Error in profile fetch/create:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        
        if (session?.user) {
          setTimeout(async () => {
            await fetchOrCreateProfile(session.user);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validateSrmEmail = (email: string): boolean => {
    return email.endsWith('@srmist.edu.in');
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error checking email exists:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking if email exists:', error);
      return false;
    }
  };

  const signIn = async (email: string) => {
    try {
      if (!validateSrmEmail(email)) {
        throw new Error('Only SRM Institute emails (@srmist.edu.in) are allowed');
      }

      // Use magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth-callback',
          shouldCreateUser: true,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Magic link sent",
        description: "Check your email for the login link"
      });
      
    } catch (error: unknown) {
      console.error('Error signing in:', error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      throw error;
    }
  };

  const signUp = async (email: string, name: string) => {
    try {
      if (!validateSrmEmail(email)) {
        throw new Error('Only SRM Institute emails (@srmist.edu.in) are allowed');
      }
      
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        throw new Error('This email is already registered. Please log in instead.');
      }

      // Use magic link for signups too
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth-callback',
          data: {
            name
          }
        }
      });
      
      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your email for the login link"
      });
      
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been logged out successfully"
      });
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error instanceof Error ? error.message : 'An unknown error occurred'
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
      
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error instanceof Error ? error.message : 'An unknown error occurred'
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
        signOut,
        updateProfile,
        checkEmailExists,
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
