import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import NotificationModal from './NotificationModal';
import SearchBar from './SearchBar'; // Importing the SearchBar component

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample notification count
  const notificationCount = 10;

  const handleNotificationClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-2xl font-bold text-teal-400">
        BookFM
      </Link>

      <SearchBar />

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
