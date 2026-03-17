'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = Cookies.get('token');


      if (token) {
        try {
          const { data } = await api.get('/auth/me');

          setUser(data);
          setIsGuest(false);
        } catch (error) {

          Cookies.remove('token', { path: '/' });
          setIsGuest(true);
        }
      } else {

        setIsGuest(true);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loginGoogle = async (credentialResponse) => {

    try {
      const { credential } = credentialResponse;
      const { data } = await api.post('/auth/google', { token: credential });

      
      const cookieOptions = { 
        expires: 7, 
        path: '/', 
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      };
      
      Cookies.set('token', data.access_token, cookieOptions); 
      const updatedUser = { ...data.user, is_new_user: data.is_new_user };
      setUser(updatedUser);
      setIsGuest(false); // ← CRITICAL: unlock FeatureGate immediately

      
      toast.success(`Welcome${data.is_new_user ? '' : ' back'}, ${data.user.first_name || 'Hunter'}!`);
      return { success: true, isNewUser: data.is_new_user, user: updatedUser };
    } catch (error) {

      toast.error("Login failed. Check console for details.");
      return { success: false };
    }
  };

  const loginWallet = async (address, signature, message) => {

    try {
      const { data } = await api.post('/auth/wallet', { address, signature, message });

      
      const cookieOptions = { 
        expires: 7, 
        path: '/', 
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      };

      Cookies.set('token', data.access_token, cookieOptions); 
      const updatedUser = { ...data.user, is_new_user: data.is_new_user };
      setUser(updatedUser);
      setIsGuest(false); // ← CRITICAL: unlock FeatureGate immediately
      
      toast.success(`Welcome${data.is_new_user ? '' : ' back'}, Hunter!`);
      return { success: true, isNewUser: data.is_new_user, user: updatedUser };
    } catch (error) {

      toast.error("Wallet authentication failed. Please verify the signature.");
      return { success: false };
    }
  };

  const loginX = async (code, codeVerifier, redirectUri) => {

    try {
      const { data } = await api.post('/auth/x', { code, code_verifier: codeVerifier, redirect_uri: redirectUri });

      
      const cookieOptions = { 
        expires: 7, 
        path: '/', 
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      };

      Cookies.set('token', data.access_token, cookieOptions);
      const updatedUser = { ...data.user, is_new_user: data.is_new_user };
      setUser(updatedUser);
      setIsGuest(false);
      
      toast.success(`Welcome${data.is_new_user ? '' : ' back'}, ${data.user.first_name || 'Hunter'}!`);
      return { success: true, isNewUser: data.is_new_user, user: updatedUser };
    } catch (error) {

      toast.error("X authentication failed. Please try again.");
      return { success: false };
    }
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = '/login';
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={{ 
        user, loading, isGuest, loginGoogle, loginWallet, loginX, logout, setUser,
        loginModalOpen,
        openLoginModal: () => setLoginModalOpen(true),
        closeLoginModal: () => setLoginModalOpen(false),
      }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
