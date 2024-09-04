import { React, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import NotificationModal from './NotificationModal';
import SearchBar from './SearchBar';
import { AuthContext } from '../../Context/authContext';

function Header() {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const notificationCount = 10;

  const { isLoggedIn, currentUser, logout } = useContext(AuthContext);

  const handleNotificationClick = () => setIsNotificationModalOpen(true);
  const handleCloseNotificationModal = () => setIsNotificationModalOpen(false);

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleCloseLogoutModal = () => setIsLogoutModalOpen(false);

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-2xl font-bold text-teal-400">
        BookFM
      </Link>

      <SearchBar />

      <div className="flex items-center space-x-4">
      <nav>
        <Link to="/discover" className="mx-3 tracking-[0.2rem] bg-teal-400 p-2 px-4 text-black rounded-md font-bold hover:bg-teal-500">
          Discover
        </Link>

        {isLoggedIn ? (
          <span
            className="mx-3 text-teal-400 cursor-pointer truncate max-w-[150px] overflow-hidden"
            onClick={handleLogoutClick}
          >
            Welcome, {currentUser?.fullName || 'User'}
          </span>
        ) : (
          <Link to="/login" className="mx-3 hover:text-teal-400">
            Log In
          </Link>
        )}
      </nav>
        <div className="relative cursor-pointer" onClick={handleNotificationClick}>
          <FaBell className="text-teal-400 text-2xl" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {notificationCount}
            </span>
          )}
        </div>
      </div>

      <NotificationModal isOpen={isNotificationModalOpen} onClose={handleCloseNotificationModal} />

      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center transform transition-transform duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">Logout Confirmation</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transform hover:scale-105 transition-transform duration-200"
              >
                Logout
              </button>
              <button
                onClick={handleCloseLogoutModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700 transform hover:scale-105 transition-transform duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
