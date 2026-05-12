/**
 * Error logging utility for tracking and reporting errors in production.
 * Can be extended to send errors to external services like Sentry, LogRocket, etc.
 */

export interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  environment: string;
}

/**
 * Log an error with comprehensive context
 */
export function logError(
  error: Error,
  context?: {
    componentStack?: string;
    customData?: Record<string, unknown>;
  }
): ErrorLog {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    componentStack: context?.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    environment: import.meta.env.MODE,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.group('🔴 Error Log');
    console.error('Message:', errorLog.message);
    console.error('Stack:', errorLog.stack);
    if (context?.componentStack) {
      console.error('Component Stack:', context.componentStack);
    }
    if (context?.customData) {
      console.error('Custom Data:', context.customData);
    }
    console.error('URL:', errorLog.url);
    console.groupEnd();
  }

  // In production, send to error tracking service
  if (!import.meta.env.DEV) {
    // Example: Send to Sentry
    // Sentry.captureException(error, { contexts: { react: { componentStack: context?.componentStack } } });

    // Example: Send to custom backend endpoint
    sendErrorToBackend(errorLog, context?.customData);
  }

  return errorLog;
}

/**
 * Send error to backend for logging and monitoring
 */
async function sendErrorToBackend(
  errorLog: ErrorLog,
  customData?: Record<string, unknown>
) {
  try {
    await fetch('/api/logs/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorLog,
        customData,
      }),
    }).catch(() => {
      // Silently fail if backend is unavailable
      // to avoid creating infinite error loops
    });
  } catch {
    // Ignore errors in error logging
  }
}

/**
 * Track promise rejections that aren't handled
 */
export function setupUnhandledRejectionHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      {
        customData: {
          promiseReason: event.reason,
        },
      }
    );
  });
}

/**
 * Track global errors
 */
export function setupErrorHandler() {
  window.addEventListener('error', (event) => {
    logError(event.error, {
      customData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });
}

/**
 * Initialize all error tracking
 */
export function initializeErrorTracking() {
  setupErrorHandler();
  setupUnhandledRejectionHandler();

  if (!import.meta.env.DEV) {
    console.log('Error tracking initialized');
  }
}
