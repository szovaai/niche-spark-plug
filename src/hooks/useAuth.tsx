import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "free" | "pro";

interface UsageLimits {
  searchesUsedToday: number;
  viewsUsedToday: number;
  maxSearches: number;
  maxViews: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole;
  usage: UsageLimits;
  canSearch: boolean;
  canViewNiche: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  incrementSearch: () => Promise<boolean>;
  incrementView: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_MAX_SEARCHES = 3;
const FREE_MAX_VIEWS = 2;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole>("free");
  const [usage, setUsage] = useState<UsageLimits>({
    searchesUsedToday: 0,
    viewsUsedToday: 0,
    maxSearches: FREE_MAX_SEARCHES,
    maxViews: FREE_MAX_VIEWS,
  });

  const canSearch = role === "pro" || usage.searchesUsedToday < FREE_MAX_SEARCHES;
  const canViewNiche = role === "pro" || usage.viewsUsedToday < FREE_MAX_VIEWS;

  const fetchUserRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    if (data?.role) {
      setRole(data.role as AppRole);
    }
  }, []);

  const refreshUsage = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase.rpc("check_and_reset_daily_limits", {
      p_user_id: user.id,
    });
    
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const result = data as Record<string, unknown>;
      if (!result.error) {
        setUsage((prev) => ({
          ...prev,
          searchesUsedToday: (result.searches_today as number) || 0,
          viewsUsedToday: (result.views_today as number) || 0,
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole("free");
          setUsage({
            searchesUsedToday: 0,
            viewsUsedToday: 0,
            maxSearches: FREE_MAX_SEARCHES,
            maxViews: FREE_MAX_VIEWS,
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  useEffect(() => {
    if (user) {
      refreshUsage();
    }
  }, [user, refreshUsage]);

  const incrementSearch = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (role === "pro") return true;
    
    const { data } = await supabase.rpc("increment_search_count", {
      p_user_id: user.id,
    });
    
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const result = data as Record<string, unknown>;
      if (result.success) {
        if (!result.unlimited) {
          setUsage((prev) => ({
            ...prev,
            searchesUsedToday: (result.count as number) || prev.searchesUsedToday + 1,
          }));
        }
        return true;
      }
    }
    return false;
  }, [user, role]);

  const incrementView = useCallback(async (): Promise<boolean> => {
    if (!user) return true;
    if (role === "pro") return true;
    
    const { data } = await supabase.rpc("increment_view_count", {
      p_user_id: user.id,
    });
    
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const result = data as Record<string, unknown>;
      if (result.success) {
        if (!result.unlimited) {
          setUsage((prev) => ({
            ...prev,
            viewsUsedToday: (result.count as number) || prev.viewsUsedToday + 1,
          }));
        }
        return true;
      }
    }
    return false;
  }, [user, role]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      role, 
      usage,
      canSearch,
      canViewNiche,
      signUp, 
      signIn, 
      signOut,
      incrementSearch,
      incrementView,
      refreshUsage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
