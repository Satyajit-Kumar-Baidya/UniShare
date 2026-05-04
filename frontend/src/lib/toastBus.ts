export type ToastKind = 'info' | 'success' | 'error';

export type ToastMessage = {
  id: string;
  message: string;
  kind: ToastKind;
};

const TOAST_EVENT = 'unishare:toast';

export function emitToast(message: string, kind: ToastKind = 'info') {
  const toast: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    kind,
  };

  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: toast }));
}

export function subscribeToToasts(listener: (toast: ToastMessage) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ToastMessage>;
    listener(customEvent.detail);
  };

  window.addEventListener(TOAST_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener(TOAST_EVENT, handler as EventListener);
  };
}
