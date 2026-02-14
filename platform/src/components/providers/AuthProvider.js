'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Cookies from 'js-cookie';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error("Session check failed:", error);
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loginGoogle = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      // Send Google token to backend to exchange for internal JWT
      const { data } = await api.post('/auth/google', { token: credential });
      
      // Store JWT
      Cookies.set('token', data.access_token, { expires: 7 }); // 7 days
      
      // Update User State
      setUser(data.user); // Assuming backend returns user object with token
      toast.success(`Welcome back, ${data.user.first_name || 'Partner'}!`);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = '/login';
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={{ user, loading, loginGoogle, logout }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
