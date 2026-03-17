'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, Wallet, Shield, Zap, Clock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export function LoginModal({ isOpen, onClose, triggerText = "Continue", persistent = false }) {
  const { loginGoogle, loginWallet, user } = useAuth();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const loginAttempted = useRef(false);

  const handleWalletLogin = useCallback(async (walletAddress) => {
    try {
      const message = `Sign in to OppForge\nAddress: ${walletAddress}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      const result = await loginWallet(walletAddress, signature, message);
      if (result?.success) {
        onClose();
        toast.success('Wallet connected successfully!');
      }
    } catch {
      loginAttempted.current = false;
    }
  }, [signMessageAsync, loginWallet, onClose]);

  useEffect(() => {
    if (isConnected && address && !user && !loginAttempted.current) {
      loginAttempted.current = true;
      handleWalletLogin(address);
    }
  }, [isConnected, address, user, handleWalletLogin]);

  useEffect(() => {
    if (!isOpen) loginAttempted.current = false;
  }, [isOpen]);

  const handleGoogleSuccess = async (response) => {
    if (response.access_token) {
      const success = await loginGoogle({ credential: response.access_token });
      if (success) {
        onClose();
        toast.success('Welcome to the Forge!');
      }
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Sign In Failed')
  });

  return (
    <Dialog open={isOpen} onOpenChange={persistent ? () => {} : onClose}>
      <DialogContent
        className="sm:max-w-md border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
        onInteractOutside={persistent ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={persistent ? (e) => e.preventDefault() : undefined}
        hideCloseButton={persistent}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/20">
              <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">
              Access The Forge
            </DialogTitle>
          </div>
          <DialogDescription className="text-[var(--text-secondary)]">
            {persistent
              ? 'Your guest preview has ended. Sign in to continue exploring Web3 opportunities with full access.'
              : 'Sign in to unlock AI-powered opportunity tracking, personalized scoring, and application drafting tools.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Google */}
          <button
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border-default)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--bg-primary)] px-2 text-[var(--text-tertiary)]">Or</span>
            </div>
          </div>

          {/* Wallet */}
          <div className="w-full [&>div]:w-full [&>div>button]:w-full [&>div>button]:justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal, connectModalOpen }) => (
                <button
                  onClick={openConnectModal}
                  disabled={connectModalOpen}
                  className="w-full flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/30 text-[var(--text-primary)] font-medium py-3 px-4 rounded-lg transition-all active:scale-[0.98]"
                >
                  <Wallet className="w-5 h-5 text-[var(--accent-primary)]" />
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>

          <div className="mt-2 p-3 rounded-lg bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/10">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Zap className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>Unlock AI scoring, proposal drafting, and 24/7 opportunity monitoring</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
