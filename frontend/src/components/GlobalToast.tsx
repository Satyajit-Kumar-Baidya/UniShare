import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { subscribeToToasts, type ToastMessage } from '../lib/toastBus';

export default function GlobalToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 4000);
    });

    return unsubscribe;
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed right-4 top-20 z-100 flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon =
          toast.kind === 'error' ? AlertCircle : toast.kind === 'success' ? CheckCircle2 : Info;

        return (
          <div
            key={toast.id}
            className={cn(
              'rounded-xl border bg-white px-4 py-3 shadow-lg backdrop-blur-sm transition-all',
              toast.kind === 'error' && 'border-rose-200 text-rose-700',
              toast.kind === 'success' && 'border-emerald-200 text-emerald-700',
              toast.kind === 'info' && 'border-blue-200 text-blue-700'
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm font-medium leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="ml-auto rounded p-1 opacity-70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
