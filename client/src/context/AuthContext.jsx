import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children })
{
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);

    return user; 
  }

  async function signup(full_name, email, password) 
  {
    await api.post('/auth/signup', { full_name, email, password });
  }

  async function logout() 
  {
    try 
    {
      await api.post('/auth/logout');
    } 
    
    catch{}

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  async function changePassword(current_password, new_password, confirm_password) 
  {
    await api.post('/auth/change-password', 
    {
      current_password,
      new_password,
      confirm_password,
    });
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() 
{
  return useContext(AuthContext);
}