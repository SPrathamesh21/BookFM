import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBell } from 'react-icons/fa';
import NotificationModal from './NotificationModal';

function MobileHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notificationCount = 9;

  const handleNotificationClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Link to="/" className="text-2xl font-bold text-teal-400">
          BookFM
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/browse" className="text-lg text-teal-400">
            Browse
          </Link>
          <div className="relative cursor-pointer" onClick={handleNotificationClick}>
            <FaBell className="text-teal-400 text-2xl" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notificationCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search ebooks..."
          className="py-2 px-4 pl-10 rounded-md w-full bg-gray-700 text-gray-100 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400" />
      </div>

      <NotificationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </header>
  );
}

export default MobileHeader;
