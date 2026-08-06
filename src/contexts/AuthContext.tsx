import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isStaff: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full user profile from public.users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data as User;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted && profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted && profile) {
          setUser(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) return { success: false, error: error.message };
      
      if (data.user) {
        // Update last_login_at
        await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id);
        
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(profile);
          return { success: true };
        }
      }
      return { success: false, error: 'Failed to load user profile' };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const role = data.email.startsWith('admin') ? 'admin' : 'customer';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            company: data.company,
            role: role
          }
        }
      });

      if (authError) return { success: false, error: authError.message };
      
      if (authData.user) {
        // Wait a tiny bit for the database trigger to finish creating the profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If email confirmations are enabled, Supabase won't return a session yet.
        if (!authData.session) {
          return { success: true, error: 'verification_required' };
        }

        const profile = await fetchUserProfile(authData.user.id);
        if (profile) {
          setUser(profile);
          return { success: true };
        }
      }
      return { success: false, error: 'Could not fetch your profile. Try logging in.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const isStaff = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'support';
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        isStaff,
        isCustomer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
