import React from "react";
import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import SideNav from "../Components/SideNav/SideNav";
import AddEBook from "../Components/AddEBook/AddEBook";
import WelcomeAdmin from "../Components/WelcomAdmin/WelcomeAdmin";
import EditEbook from "../Components/EditEBook/EditEBook";
import EditBookList from "../Components/EditEBook/EditEBookPage";
import NotFound from "../../NotFound"

const Layout = () => {
  return (
    <>

      <div className="flex h-screen ">
        {/* Side Navigation */}
        <SideNav />

        {/* Main Content */}
        <div className="flex-1 ml-1/4  overflow-auto  ">


          <Routes>
            
            <Route path="/" element={<WelcomeAdmin />} />
            <Route path="/AddEBook" element={<AddEBook />} />
            <Route path="/EditEBook/:id" element={<EditEbook />} />
            <Route path="/EditEBookPage" element={<EditBookList />} />
            <Route path="/404" element={<NotFound />} /> {/* Explicitly define the 404 route */}
            <Route path="*" element={<Navigate to="/404" replace />} /> {/* Catch-all route for undefined paths */}
    
          </Routes>
          <Outlet />

        </div>
      </div>
    </>
  );
};

export default Layout;
