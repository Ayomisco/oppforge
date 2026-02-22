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

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = Cookies.get('token');
      const guestCookie = Cookies.get('isGuest');

      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          setIsGuest(false);
        } catch (error) {
          console.error("Session check failed:", error);
          Cookies.remove('token');
          // Fallback to guest if token invalid
          setIsGuest(true);
        }
      } else {
        // No token = Guest
        setIsGuest(true);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loginGoogle = async (credentialResponse) => {
    console.log("Executing loginGoogle with credential...");
    try {
      const { credential } = credentialResponse;
      const { data } = await api.post('/auth/google', { token: credential });
      console.log("Backend auth successful, received token:", !!data.access_token);
      
      const cookieOptions = { 
        expires: 7, 
        path: '/', 
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      };
      
      Cookies.set('token', data.access_token, cookieOptions); 
      setUser(data.user);
      console.log("User state updated in context:", data.user.email);
      
      toast.success(`Welcome back, ${data.user.first_name || 'Partner'}!`);
      return true;
    } catch (error) {
      console.error("Login process failed at some step:", error);
      toast.error("Login failed. Check console for details.");
      return false;
    }
  };

  const loginWallet = async (address) => {
    console.log("Executing loginWallet with address:", address);
    try {
      const { data } = await api.post('/auth/wallet', { address });
      console.log("Wallet auth successful, received token:", !!data.access_token);
      
      const cookieOptions = { 
        expires: 7, 
        path: '/', 
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      };

      Cookies.set('token', data.access_token, cookieOptions); 
      setUser(data.user);
      
      toast.success(`Welcome back, Hunter!`);
      return true;
    } catch (error) {
      console.error("Wallet login failed:", error);
      toast.error("Wallet authentication failed.");
      return false;
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
      <AuthContext.Provider value={{ user, loading, isGuest, loginGoogle, loginWallet, logout, setUser }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
