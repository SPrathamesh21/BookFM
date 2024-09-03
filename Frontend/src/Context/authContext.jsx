import React, { createContext, useState, useEffect } from 'react';
import axios from '../../axiosConfig'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [premiumPlan, setPremiumPlan] = useState(null);
  const [premiumPlanExpiry, setPremiumPlanExpiry] = useState(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/check-auth');
        setIsLoggedIn(response.data.isAuthenticated);
        setCurrentUser(response.data.user); 
        setPremiumPlan(response.data.user.premiumPlan);
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
    setPremiumPlan(userData.premiumPlan);
    setPremiumPlanExpiry(userData.premiumExpiresAt)
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      alert('Logout failed!');
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    setPremiumPlan(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
