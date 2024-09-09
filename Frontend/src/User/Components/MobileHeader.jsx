import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import SearchBar from './SearchBar';
import axios from '../../../axiosConfig';

const NotificationModalLazy = lazy(() => import('./NotificationModal'));

const getRecentMessages = (messages, days = 15) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return messages.filter(msg => new Date(msg.dateAdded) >= cutoffDate);
};

function MobileHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unread: [], read: [] });
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchNotifications();
  }, []);

  const handleNotificationClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const notificationModal = useMemo(() => (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationModalLazy
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notifications={notifications}
        setNotifications={setNotifications} 
        loading={loading}
        error={error}
      />
    </Suspense>
  ), [isModalOpen, notifications, loading, error]);

  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Link to="/" className="text-2xl font-bold text-teal-400">
          BookFM
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/discover" className="bg-teal-400 p-2 px-4 text-black rounded-md font-bold tracking-[0.2rem] hover:bg-teal-500">
            Discover
          </Link>
          <div className="relative cursor-pointer" onClick={handleNotificationClick}>
          <FaBell className={`text-teal-400 text-2xl ${notificationCount > 0 ? 'animate-bounce' : ''}`} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <SearchBar />

      {isModalOpen && notificationModal}
    </header>
  );
}

export default MobileHeader;
