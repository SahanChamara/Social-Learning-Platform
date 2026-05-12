import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component catches React render errors and displays a fallback UI.
 * Prevents the entire app from crashing on component errors.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error component stack:', errorInfo.componentStack);

    // Store error information in state
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send to error tracking service (Sentry, LogRocket, etc.)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRetry = () => {
    this.handleReset();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-slate-200">
            {/* Error Icon Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-6 flex flex-col items-center border-b border-slate-200">
              <div className="bg-red-100 p-3 rounded-full mb-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 text-center">
                Oops! Something went wrong
              </h1>
              <p className="text-sm text-slate-600 text-center mt-2">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 max-h-48 overflow-auto">
                <details className="cursor-pointer">
                  <summary className="font-semibold text-slate-700 hover:text-slate-900 mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <p className="text-xs font-mono text-red-600 break-words">
                        {this.state.error.message}
                      </p>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <p className="text-xs font-mono text-slate-600 whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 py-4 flex flex-col gap-2">
              <Button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg">
              <p className="text-xs text-slate-600 text-center">
                If the problem persists, please clear your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
