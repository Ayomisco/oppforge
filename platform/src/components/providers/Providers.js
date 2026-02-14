'use client';

import { AuthProvider } from './AuthProvider';
import { Web3Provider } from './Web3Provider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <Web3Provider>
      <AuthProvider>
        {children}
        <Toaster position="bottom-right" />
      </AuthProvider>
    </Web3Provider>
  );
}
