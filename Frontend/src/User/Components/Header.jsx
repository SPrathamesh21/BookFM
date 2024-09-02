import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaBell } from 'react-icons/fa';
import NotificationModal from './NotificationModal';

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  // Sample notification count
  const notificationCount = 9;

  const handleNotificationClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-2xl font-bold text-teal-400">
        BookFM
      </Link>

      {/* Search Bar */}
      <div className="relative flex-grow max-w-md mx-4">
        <input
          type="text"
          placeholder="Search ebooks..."
          className="py-2 px-4 pl-10 rounded-md w-full bg-gray-700 text-gray-100 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400" />
      </div>

      {/* Navigation and Notifications */}
      <div className="flex items-center space-x-4">
        <nav>
          <Link to="/discover" className="mx-3 tracking-[0.2rem] bg-teal-400 p-2 px-4 text-black rounded-md font-bold hover:bg-teal-500">
          Discover
        </Link>
        <Link to="/signup" className="mx-3 hover:text-teal-400">
          Sign Up
        </Link>
        </nav>

        {/* Notifications */}
        <div className="relative cursor-pointer" onClick={handleNotificationClick}>
          <FaBell className="text-teal-400 text-2xl" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {notificationCount}
            </span>
          )}
        </div>
      </div>

      <NotificationModal isOpen={isModalOpen} onClose={handleCloseModal} />

    </header>
  );
}

export default Header;
