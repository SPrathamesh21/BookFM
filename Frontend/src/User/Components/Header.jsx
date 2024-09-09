import React, { useState, useEffect, useContext, useMemo, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import SearchBar from './SearchBar';
import { AuthContext } from '../../Context/authContext';
import axios from '../../../axiosConfig';

const NotificationModalLazy = lazy(() => import('./NotificationModal'));

// Utility function to get recent messages
const getRecentMessages = (messages, days = 15) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return messages.filter(msg => new Date(msg.dateAdded) >= cutoffDate);
};

function Header() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unread: [], read: [] });
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, currentUser, logout } = useContext(AuthContext);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications');
      const fetchedMessages = response.data.notifications;
      const unreadCount = response.data.unreadCount;

      if (Array.isArray(fetchedMessages)) {
        const recentMessages = getRecentMessages(fetchedMessages);

        const unreadMessages = recentMessages
          .filter((msg) => !msg.read)
          .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        const readMessages = recentMessages
          .filter((msg) => msg.read)
          .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        setNotifications({ unread: unreadMessages, read: readMessages });
        setNotificationCount(unreadCount);
      } else {
        console.error('Unexpected data format:', fetchedMessages);
        throw new Error('Data format is incorrect');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
    fetchNotifications(); // Optionally refetch notifications when closing the modal
  };

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleCloseLogoutModal = () => setIsLogoutModalOpen(false);

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
  };

  const notificationModal = useMemo(() => (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationModalLazy
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        notifications={notifications}
        loading={loading}
        error={error}
        setNotifications={setNotifications} // Pass setNotifications as a prop
      />
    </Suspense>
  ), [isNotificationModalOpen, notifications, loading, error, setNotifications]);

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
            <button
              className="mx-3 text-teal-400 cursor-pointer truncate overflow-hidden whitespace-nowrap max-w-[150px]"
              onClick={handleLogoutClick}
            >
              Welcome, {currentUser?.fullName || 'User'}
            </button>
          ) : (
            <Link to="/login" className="mx-3 hover:text-teal-400">
              Log In
            </Link>
          )}
        </nav>
        
        <div className="relative">
          <button
            onClick={handleOpenNotificationModal}
            className={`relative ${notificationCount}`}
          >
            <FaBell className={`text-teal-400 text-2xl ${notificationCount > 0 ? 'animate-bounce' : ''}`} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {isNotificationModalOpen && notificationModal}
        </div>
        
      </div>

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
