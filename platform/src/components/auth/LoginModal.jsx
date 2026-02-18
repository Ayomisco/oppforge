'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, Wallet } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export function LoginModal({ isOpen, onClose, triggerText = "Continue" }) {
  const { loginGoogle, loginWallet } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await loginGoogle(credentialResponse);
    if (success) onClose();
  };

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
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                width="100%"
              />
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
