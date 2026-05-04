import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import AppErrorBoundary from './components/AppErrorBoundary.tsx';
import GlobalToast from './components/GlobalToast.tsx';
import { queryClient } from './lib/queryClient.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <GlobalToast />
      </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
