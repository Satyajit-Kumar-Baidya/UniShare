import { AlertTriangle, RefreshCcw } from 'lucide-react';

type QueryErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export default function QueryErrorState({
  title = 'Unable to load data',
  message = 'Something went wrong while loading this section.',
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-rose-800">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-100 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
