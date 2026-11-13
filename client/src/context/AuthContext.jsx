// Keeps track of the logged-in user and shares it with every component
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we check the saved token (no token means nothing to check)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  // On page load / refresh: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token')) // token expired or invalid
      .finally(() => setLoading(false));
  }, []);

  // Called after a successful login or register
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Shortcut hook: const { user, login, logout } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
