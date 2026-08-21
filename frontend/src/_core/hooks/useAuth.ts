import { authApi, type User } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Auth hook backed by the Django REST + SimpleJWT API in `@/lib/api`.
 * Access/refresh tokens live in localStorage (set by authApi.login).
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};

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

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh,
  };
}
