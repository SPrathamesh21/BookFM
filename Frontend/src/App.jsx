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
import EPUB from './User/Components/EpubViewerComponent';
import EBookReader from './User/Components/EpubViewerComponent';
import YourLibrary from './User/Pages/YourLibrary';
import EpubReader from './User/Pages/Example';
import Flipbook from './User/Components/FlipBook';
import DocumentViewer from './User/Pages/DocumentViewer';
import RecommendedCabin from './User/Components/Recommended';
import MostReadBooks from './User/Components/MostReadBooks';
import ThirdCarousel from './User/Components/3rdCarousel';
import ForthCaousel from './User/Components/4thCarousel';



function App() { 
  const [isMobile, setIsMobile] = useState(false); 
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleMediaQueryChange);

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
        <Route path='/yourlibrary' element={<YourLibrary />} />
        <Route path='/recommendedbycabin' element={<RecommendedCabin />} />
        <Route path='/mostreadbooks' element={<MostReadBooks />} />
        <Route path='/ThirdCarousel' element={<ThirdCarousel />} />
        <Route path='/ForthCaousel' element={<ForthCaousel />} />
        <Route path='/inner' element={<EBookReader />} />
        <Route path='/epub' element={<EPUB />} />
        <Route path='/example' element={<EpubReader />} />
        <Route path="/book/:bookId" element={<ExpandedView />} /> 
        <Route path="/admin_panel/*" element={<DefaultAdminPage />} />
        <Route path="/pdf" element={<PdfViewerComponent />} />
        <Route path="/flipbook" element={<Flipbook />} />
        <Route path="/404" element={<NotFound />} /> 
        <Route path="/documentviewer" element={<DocumentViewer />} /> 
        <Route path="*" element={<Navigate to="/404" replace />} /> 

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
