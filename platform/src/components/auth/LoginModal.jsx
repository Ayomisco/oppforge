'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, Wallet } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export function LoginModal({ isOpen, onClose, triggerText = "Continue" }) {
  const { loginGoogle, loginWallet } = useAuth();

  const handleGoogleSuccess = async (response) => {
    if (response.access_token) {
      const success = await loginGoogle({ credential: response.access_token });
      if (success) onClose();
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Sign In Failed')
  });


  const handleWalletLogin = async () => {
    // Mock wallet connection for now
    // In real app, would use wallet adapter
    const success = await loginWallet("0xMockAddress..."); 
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-[#333] bg-[#0A0A0A] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#D4AF37]">
            Join the Forge
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to {triggerText.toLowerCase()}. Unlock AI tools, track applications, and level up your career.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Google Login */}
          <div className="w-full flex justify-center">
             <button
                 onClick={() => loginWithGoogle()}
                 className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] text-white font-medium py-2.5 px-4 rounded-full border border-[#333] transition-all"
             >
                 <img 
                     src="https://www.google.com/favicon.ico" 
                     alt="Google" 
                     className="w-4 h-4 bg-white rounded-full p-0.5"
                 />
                 Continue with Google
             </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0A0A0A] px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button 
            onClick={handleWalletLogin}
            variant="outline" 
            className="w-full border-[#333] hover:bg-[#1A1A1A] text-white gap-2 h-11"
          >
            <Wallet className="w-4 h-4 text-[#D4AF37]" />
            Connect Wallet (Web3)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
