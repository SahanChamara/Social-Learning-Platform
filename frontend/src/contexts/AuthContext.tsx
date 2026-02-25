import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation as useApolloMutation, useQuery as useApolloQuery } from '@apollo/client/react';
import { apolloClient } from '../lib/apollo';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  REFRESH_TOKEN_MUTATION,
  ME_QUERY,
} from '../graphql/auth';
import type {
  User,
  LoginInput,
  RegisterInput,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  MeResponse,
} from '../types/auth';

// Auth Context Types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// Token Storage Keys
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL Mutations
  const [loginMutation] = useApolloMutation<LoginResponse>(LOGIN_MUTATION);
  const [registerMutation] = useApolloMutation<RegisterResponse>(REGISTER_MUTATION);
  const [refreshTokenMutation] = useApolloMutation<RefreshTokenResponse>(REFRESH_TOKEN_MUTATION);

  // Query current user
  const { refetch: refetchMe } = useApolloQuery<MeResponse>(ME_QUERY, {
    skip: true, // Don't run automatically, we'll call it manually
  });

  // Store tokens in localStorage
  const storeTokens = useCallback((token: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }, []);

  // Clear tokens from localStorage
  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  // Get stored token
  const getStoredToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  // Get stored refresh token
  const getStoredRefreshToken = useCallback(() => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }, []);

  // Login function
  const login = useCallback(
    async (input: LoginInput) => {
      try {
        const { data } = await loginMutation({
          variables: { input },
        });

        if (data?.login) {
          const { token, refreshToken, user: userData } = data.login;
          storeTokens(token, refreshToken);
          setUser(userData);
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [loginMutation, storeTokens]
  );

  // Register function
  const register = useCallback(
    async (input: RegisterInput) => {
      try {
        const { data } = await registerMutation({
          variables: { input },
        });

        if (data?.register) {
          const { token, refreshToken, user: userData } = data.register;
          storeTokens(token, refreshToken);
          setUser(userData);
        }
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    },
    [registerMutation, storeTokens]
  );

  // Logout function
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    // Clear Apollo cache to remove any cached user data
    apolloClient.clearStore();
  }, [clearTokens]);

  // Refresh authentication (get current user from token)
  const refreshAuth = useCallback(async () => {
    const token = getStoredToken();
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to fetch current user with existing token
      const { data } = await refetchMe();
      
      if (data?.me) {
        setUser(data.me);
      } else {
        // Token is invalid, try to refresh
        const refreshToken = getStoredRefreshToken();
        
        if (refreshToken) {
          const { data: refreshData } = await refreshTokenMutation({
            variables: { refreshToken },
          });

          if (refreshData?.refreshToken) {
            const { token: newToken, refreshToken: newRefreshToken, user: userData } =
              refreshData.refreshToken;
            storeTokens(newToken, newRefreshToken);
            setUser(userData);
          } else {
            // Refresh failed, clear tokens
            logout();
          }
        } else {
          // No refresh token, clear everything
          logout();
        }
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [getStoredToken, getStoredRefreshToken, refetchMe, refreshTokenMutation, storeTokens, logout]);

  // Initialize auth state on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Context value (memoized to prevent unnecessary re-renders)
  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, isLoading, login, register, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export context for use in custom hook
export { AuthContext };
