'use client';

import { useAuth } from '../../components/providers/AuthProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loginGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white p-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-xl border border-gray-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to OppForge
          </h1>
          <p className="text-gray-400">Sign in to access your Web3 opportunities.</p>
        </div>

        <div className="space-y-6">
          {/* Method 1: Google */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-gray-300 mb-2">Social Login</label>
            <GoogleLogin
              onSuccess={loginGoogle}
              onError={() => console.log('Login Failed')}
              theme="filled_black"
              shape="pill"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1E293B] px-2 text-gray-400">Or Connect Wallet</span>
            </div>
          </div>

          {/* Method 2: Wallet */}
          <div className="flex justify-center">
            <ConnectButton 
              label="Connect Wallet"
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          By connecting, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
