import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaBell, FaTimes } from 'react-icons/fa';

const initialMessages = {
  unread: [
    { id: 1, text: 'New book release! Check out the latest titles.', details: 'Full details about the new book release. Visit our website for more information.', color: 'bg-red-500' },
    { id: 2, text: 'Your subscription has been updated. Enjoy the new features!', details: 'Details about your updated subscription. New features include...', color: 'bg-red-500' },
    { id: 3, text: 'Reminder: Your favorite book is on sale for a limited time.', details: 'Details about the sale. Save up to 50% on your favorite book.', color: 'bg-red-500' },
  ],
  read: [
    { id: 4, text: 'Welcome to BookFM! Explore your favorite books and more.', details: 'Welcome details and how to get started with BookFM.', color: 'bg-gray-700' },
    { id: 5, text: 'Your profile has been updated successfully.', details: 'Details of the profile update and new features.', color: 'bg-gray-700' },
    { id: 6, text: 'Thank you for your feedback! We appreciate your input.', details: 'Details about the feedback and changes made based on it.', color: 'bg-gray-700' },
    { id: 7, text: 'We have added new features based on user feedback.', details: 'Details of the new features and how they benefit you.', color: 'bg-gray-700' },
  ],
};

function Header() {
  const [messages, setMessages] = useState(initialMessages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;

  const notificationCount = messages.unread.length;

  const handleNotificationClick = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const handleCardClick = (message) => {
    // Move the message to read
    setMessages(prev => {
      // Filter out the message from unread
      const newUnread = prev.unread.filter(msg => msg.id !== message.id);
      // Add the message to read, ensuring no duplicates
      const newRead = prev.read.some(msg => msg.id === message.id)
        ? prev.read
        : [...prev.read, { ...message, color: 'bg-gray-700' }]; // Update the color to indicate read
      return { unread: newUnread, read: newRead };
    });
    setSelectedMessage(message);
  };

  const handleCloseDetailModal = () => setSelectedMessage(null);

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

      {/* Navigation Links and Notifications */}
      <div className="flex items-center space-x-4">
        <nav className="flex space-x-4">
          <Link to="/" className={`hover:text-teal-400 ${currentPath === '/' ? 'text-teal-400' : ''}`}>
            Home
          </Link>
          <Link to="/browse" className={`hover:text-teal-400 ${currentPath === '/browse' ? 'text-teal-400' : ''}`}>
            Browse
          </Link>
          <Link to="/signup" className={`hover:text-teal-400 ${currentPath === '/signup' ? 'text-teal-400' : ''}`}>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-lg relative max-h-80 overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={handleCloseModal}
            >
              <FaTimes className="text-2xl" />
            </button>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <div className="mb-4 flex">
              <button
                className={`py-2 px-4 rounded-md mr-2 ${!showRead ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                onClick={() => setShowRead(false)}
              >
                Unread ({messages.unread.length})
              </button>
              <button
                className={`py-2 px-4 rounded-md ${showRead ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                onClick={() => setShowRead(true)}
              >
                Read ({messages.read.length})
              </button>
            </div>
            <div className="space-y-2">
              {(showRead ? messages.read : messages.unread).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-md ${msg.color} text-white cursor-pointer`}
                  onClick={() => handleCardClick(msg)}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white w-1/2 p-8 rounded-lg relative max-h-80 overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={handleCloseDetailModal}
            >
              <FaTimes className="text-2xl" />
            </button>
            <h2 className="text-xl font-bold mb-4">Message Details</h2>
            <p className="text-gray-700">{selectedMessage.details}</p>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
