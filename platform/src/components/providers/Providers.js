'use client';

import { AuthProvider } from './AuthProvider';
import { Web3Provider } from './Web3Provider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <Web3Provider>
      <AuthProvider>
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 85, 0, 0.2)',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
            },
          }}
        />
      </AuthProvider>
    </Web3Provider>
  );
}
