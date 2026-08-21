import { authApi, type User } from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: unknown;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<User | null>;
  logout: () => void;
  refresh: () => Promise<User | null>;
  updateProfile: (data: Partial<Pick<User, "full_name" | "phone">>) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Holds the single source of truth for auth state. Mounted once at the app
 * root so every component that calls `useAuth()` sees the same `user`
 * instead of each component tracking its own local copy (which is what
 * caused the login form to update its own state while the rest of the app,
 * e.g. DashboardLayout, kept rendering as logged-out until a full refresh).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const me = await authApi.me();
      setUser(me);
      setError(null);
      return me;
    } catch (err) {
      setUser(null);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login(email, password);
      return refresh();
    },
    [refresh]
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      await authApi.register(fullName, email, password, confirmPassword);
      // Registration doesn't log the user in automatically on this API.
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<User, "full_name" | "phone">>) => {
      const me = await authApi.updateMe(data);
      setUser(me);
      return me;
    },
    []
  );

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Auth hook backed by the Django REST + SimpleJWT API in `@/lib/api`.
 * Access/refresh tokens live in localStorage (set by authApi.login).
 * Reads from the shared `AuthProvider` context so all callers stay in sync.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { loading, user } = context;

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) {
      window.location.href = redirectPath;
    }
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  return context;
}
