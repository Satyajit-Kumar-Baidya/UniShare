import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import type { ReactNode } from 'react';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          An unexpected UI error occurred. You can retry this screen or go back to home.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
}
