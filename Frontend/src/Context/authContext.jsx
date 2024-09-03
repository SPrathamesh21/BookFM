import React, { createContext, useState, useEffect } from 'react';
import axios from '../../axiosConfig'; 
import { toast } from 'react-toastify';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/check-auth');
        setIsLoggedIn(response.data.isAuthenticated);
        setCurrentUser(response.data.user); 
      } catch (error) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      toast.error('Logout failed!');
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
