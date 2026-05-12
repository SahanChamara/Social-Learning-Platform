import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apollo';
import { AuthProvider } from './contexts';
import { initializeErrorTracking } from './lib/errorLogger';
import './index.css';
import App from './App.tsx';

// Initialize global error tracking
initializeErrorTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
