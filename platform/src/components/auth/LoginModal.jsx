'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, Wallet, Shield, Zap } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export function LoginModal({ isOpen, onClose, triggerText = "Continue" }) {
  const { loginGoogle, loginWallet, user } = useAuth();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const loginAttempted = useRef(false);

  // Auto-login when wallet connects
  useEffect(() => {
    if (isConnected && address && !user && !loginAttempted.current) {
      loginAttempted.current = true;
      
      const handleSiweLogin = async () => {
        try {
            const timestamp = Date.now();
            const message = `Sign in to OppForge\n\nWelcome back, Hunter. Sign this message to authenticate your wallet. This costs zero gas.\n\nAddress: ${address}\nTimestamp: ${timestamp}`;
            
            const signature = await signMessageAsync({ message });
            
            const success = await loginWallet(address, signature, message);
            if (success) {
              onClose();
              toast.success('Wallet verified securely!');
            } else {
              loginAttempted.current = false; // allow retry if backend failed
            }
        } catch (err) {
            console.error("Signature rejected or failed:", err);
            toast.error("Signature required to authenticate");
            loginAttempted.current = false; // allow retry
        }
      };

      handleSiweLogin();
    }
  }, [isConnected, address, user, loginWallet, onClose, signMessageAsync]);

  // Reset ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      loginAttempted.current = false;
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-[#ff5500]/20 bg-[#0D0A07] text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#ff5500]/10 border border-[#ff5500]/20">
              <Shield className="w-5 h-5 text-[#ff5500]" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Access The Forge
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Sign in to unlock AI-powered opportunity tracking, personalized scoring, and application drafting tools.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Google Login */}
          <button
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0D0A07] px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Wallet Connect with RainbowKit */}
          <div className="w-full [&>div]:w-full [&>div>button]:w-full [&>div>button]:justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal, connectModalOpen }) => (
                <button
                  onClick={openConnectModal}
                  disabled={connectModalOpen}
                  className="w-full flex items-center justify-center gap-3 bg-[#1a1512] hover:bg-[#ff5500]/10 border border-[#ff5500]/30 text-white font-medium py-3 px-4 rounded-lg transition-all"
                >
                  <Wallet className="w-5 h-5 text-[#ff5500]" />
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>

          {/* Features teaser */}
          <div className="mt-2 p-3 rounded-lg bg-[#ff5500]/5 border border-[#ff5500]/10">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Zap className="w-3 h-3 text-[#ff5500]" />
              <span>Unlock AI scoring, proposal drafting, and 24/7 opportunity monitoring</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
