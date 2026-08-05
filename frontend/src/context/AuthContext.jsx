import { createContext, useCallback, useEffect, useState } from 'react';
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  refreshRequest,
  getMeRequest,
} from '../api/auth.api';
import { setAccessToken } from '../api/axiosClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On first load, try to silently restore a session using the httpOnly
  // refresh cookie (if the browser still has one from a previous visit).
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const refreshResult = await refreshRequest();
        const token = refreshResult?.data?.accessToken;
        if (!token) throw new Error('No access token returned');
        setAccessToken(token);

        const meResult = await getMeRequest();
        if (isMounted) setUser(meResult?.data?.user || null);
      } catch (err) {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    try {
      const result = await registerRequest(payload);
      setAccessToken(result?.data?.accessToken);
      setUser(result?.data?.user || null);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(message);
      throw err;
    }
  }, []);

  const login = useCallback(async (payload) => {
    setAuthError(null);
    try {
      const result = await loginRequest(payload);
      setAccessToken(result?.data?.accessToken);
      setUser(result?.data?.user || null);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email/username or password.';
      setAuthError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (err) {
      // Even if the network call fails, clear local state so the UI
      // reflects a logged-out session.
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUserLocally = useCallback((partialUser) => {
    setUser((prev) => (prev ? { ...prev, ...partialUser } : prev));
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    authError,
    register,
    login,
    logout,
    updateUserLocally,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
