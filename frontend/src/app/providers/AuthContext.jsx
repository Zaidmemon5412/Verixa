/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '../../shared/utils/token';
import authService from '../../features/auth/services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  /**
   * Helper function to update local state user information.
   * @param {object} userData - New user metadata
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  /**
   * Log out user, invalidate backend session token, and clear client-side storage.
   */
  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    setLoading(true);
    try {
      if (refresh) {
        await authService.logout(refresh);
      }
    } catch (err) {
      console.error('Logout error blacklisting token:', err);
    } finally {
      clearTokens();
      setUser(null);
      setAccessTokenState(null);
      setLoading(false);
    }
  }, []);

  /**
   * Fetch profile data of the currently logged-in user.
   * @returns {Promise<object>} Authenticated user profile data
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Profile fetch failed.');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      throw err;
    }
  }, []);

  /**
   * Register a new user account.
   * NOTE: Does NOT set auth tokens or create an authenticated session.
   * @param {object} userData - User registration details
   * @returns {Promise<object>} Registered user data response
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      console.error('Registration action failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Perform authentication login handshake.
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<object>} Auth payload containing tokens and user data
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { access, refresh, user: userData } = response.data;
        setAccessToken(access);
        setRefreshToken(refresh);
        setAccessTokenState(access);
        setUser(userData);
        return response.data;
      } else {
        throw new Error(response.message || 'Login credentials invalid.');
      }
    } catch (err) {
      console.error('Login action failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh the access token using the stored refresh token.
   * @returns {Promise<string|null>} The new access token, or null on error
   */
  const refreshAccessToken = useCallback(async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      logout();
      return null;
    }
    try {
      const response = await authService.refreshToken(refresh);
      if (response.success && response.data) {
        const { access } = response.data;
        setAccessToken(access);
        setAccessTokenState(access);
        return access;
      }
    } catch (err) {
      console.error('Token refresh action failed:', err);
      logout();
      return null;
    }
  }, [logout]);

  /**
   * Initialize state checking for existing local authentication tokens.
   */
  const initializeAuth = useCallback(async () => {
    const token = getAccessToken();
    const refresh = getRefreshToken();

    if (!token && !refresh) {
      setUser(null);
      setAccessTokenState(null);
      setInitialized(true);
      return;
    }

    try {
      if (token) {
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setAccessTokenState(token);
          setInitialized(true);
          return;
        }
      }

      if (refresh) {
        const refreshResp = await authService.refreshToken(refresh);
        if (refreshResp.success && refreshResp.data) {
          const { access } = refreshResp.data;
          setAccessToken(access);
          setAccessTokenState(access);
          
          const profileResp = await authService.getProfile();
          if (profileResp.success && profileResp.data) {
            setUser(profileResp.data);
          }
        } else {
          clearTokens();
          setUser(null);
          setAccessTokenState(null);
        }
      } else {
        clearTokens();
        setUser(null);
        setAccessTokenState(null);
      }
    } catch (err) {
      console.warn('Initial session restore failed, clearing tokens:', err);
      clearTokens();
      setUser(null);
      setAccessTokenState(null);
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    const handleLogoutEvent = () => {
      clearTokens();
      setUser(null);
      setAccessTokenState(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [initializeAuth]);

  const value = {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    loading,
    initialized,
    register,
    login,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    initializeAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
