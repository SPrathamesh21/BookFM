import React from "react";
import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import SideNav from "../Components/SideNav/SideNav";
import AddEBook from "../Components/AddEBook/AddEBook";
import WelcomeAdmin from "../Components/WelcomAdmin/WelcomeAdmin";

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

          </Routes>
          <Outlet />

        </div>
      </div>
    </>
  );
};

export default Layout;
