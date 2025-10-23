import React, { createContext, useState, useContext, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('/api/auth/google/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        if (res.ok) {
          const data = await res.json();
          const userData = { ...data.user, token: tokenResponse.access_token };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData)); // Persist user
          console.log('Logged in user:', data.user);
        } else {
          alert('Token verification failed');
        }
      } catch {
        alert('Network or server error');
      }
    },
    onError: () => alert('Login Failed'),
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear persisted user
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
