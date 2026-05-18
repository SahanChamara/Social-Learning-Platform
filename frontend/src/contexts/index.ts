// Export all context providers
export { AuthProvider } from './AuthContext';
export { NotificationProvider } from './NotificationContext';
export { ThemeProvider, useTheme } from './ThemeContext';

// Re-export useAuth hook for convenience
export { useAuth } from '../hooks/useAuth';
