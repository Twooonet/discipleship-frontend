import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
    setLoading(false);
  }, []);

  async function login(password) {
    const res = await api.post('/auth/login', { password });
    localStorage.setItem('adminToken', res.data.token);
    setIsAdmin(true);
  }

  function logout() {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
