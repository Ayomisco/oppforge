'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Suspense } from 'react';

function XCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginX } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      router.push('/login');
      return;
    }

    // Retrieve PKCE verifier from sessionStorage
    const codeVerifier = sessionStorage.getItem('x_code_verifier');
    const savedState = sessionStorage.getItem('x_oauth_state');
    const redirectUri = `${window.location.origin}/auth/x/callback`;

    // Clean up
    sessionStorage.removeItem('x_code_verifier');
    sessionStorage.removeItem('x_oauth_state');

    if (!codeVerifier || (savedState && state !== savedState)) {
      router.push('/login');
      return;
    }

    const handleLogin = async () => {
      const result = await loginX(code, codeVerifier, redirectUri);
      if (result?.success) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };

    handleLogin();
  }, [searchParams, loginX, router]);

  return (
    <div className="min-h-screen bg-[#050403] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm font-mono">Authenticating with X...</p>
      </div>
    </div>
  );
}

export default function XCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050403] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <XCallbackInner />
    </Suspense>
  );
}
