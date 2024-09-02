import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './User/Pages/Home'
import Header from './User/Components/Header'
import React from "react";
import MobileHeader from './User/Components/MobileHeader';
import Footer from './User/Components/Footer';


import DefaultAdminPage from "../src/Admin/Pages/DefaultAdminPage"
function App() { 
  const [isMobile, setIsMobile] = useState(false); 
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };

    // Set the initial state
    setIsMobile(mediaQuery.matches);

    // Add the listener
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    // Clean up the listener on component unmount
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  const shouldShowHeader = !(location.pathname.startsWith('/admin') || location.pathname.startsWith('/404'));
  const shouldShowFooter = !(location.pathname.startsWith('/admin') || location.pathname.startsWith('/404'));
  return (
    <>
    {shouldShowHeader && (isMobile ? <MobileHeader /> : <Header />)}

      <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/header' element={<Header />} />
       <Route path="/admin_panel/*" element={<DefaultAdminPage />} />
        </Routes>
        {shouldShowFooter && <Footer />}
    </>
  );
}


function AppWrapper(){
  return (
    <Router>
      <App />
    </Router>
  )
}
export default AppWrapper
