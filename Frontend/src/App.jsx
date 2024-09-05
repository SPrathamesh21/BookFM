import { useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import Home from './User/Pages/Home'
import Header from './User/Components/Header'
import React from "react";
import MobileHeader from './User/Components/MobileHeader';
import Footer from './User/Components/Footer';
import DefaultAdminPage from "../src/Admin/Pages/DefaultAdminPage"
import ExpandedView from './User/Components/expandedView';
import Discover from './User/Pages/Discover';
import Signup from './User/Pages/Signup';
import Login from './User/Pages/Login';
import CategoryPage from './User/Pages/CategoryPage';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './Context/authContext'
import NotFound from './NotFound';
import PdfViewerComponent from './User/Components/PdfViewerComponent';
import DocumentViewer from './User/Components/DocumentViewer';
import EPUB from './User/Components/EpubViewerComponent';
import EBookReader from './User/Components/EpubViewerComponent';

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
        <Route path='/discover' element={<Discover />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/header' element={<Header />} />
        <Route path='/inner' element={<EBookReader />} />
        <Route path="/book/:bookId" element={<ExpandedView />} /> {/* New route */}
        <Route path="/admin_panel/*" element={<DefaultAdminPage />} />
        <Route path="/404" element={<NotFound />} /> {/* Explicitly define the 404 route */}
        <Route path="*" element={<Navigate to="/404" replace />} /> {/* Catch-all route for undefined paths */}

      </Routes>
        <ToastContainer />
        {shouldShowFooter && <Footer />}
        
    </>
  );
}

function AppWrapper(){
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
    
  )
}
export default AppWrapper
