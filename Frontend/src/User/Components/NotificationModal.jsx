import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const initialMessages = {
  unread: [
    { id: 1, text: 'New book release! Check out the latest titles.' },
    { id: 2, text: 'Your subscription has been updated. Enjoy the new features!' },
    { id: 3, text: 'Reminder: Your favorite book is on sale for a limited time.' },
  ],
  read: [
    { id: 4, text: 'Welcome to BookFM! Explore your favorite books and more.' },
    { id: 5, text: 'Your profile has been updated successfully.' },
    { id: 6, text: 'Thank you for your feedback! We appreciate your input.' },
    { id: 7, text: 'We have added new features based on user feedback.' },
  ],
};

function NotificationModal({ isOpen, onClose }) {
  const [showRead, setShowRead] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleCardClick = (message) => {
    setSelectedMessage(message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md p-6 rounded-lg relative max-h-screen md:max-h-80 overflow-hidden">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FaTimes className="text-2xl" />
        </button>
        <h2 className="text-xl font-bold mb-4">Notifications</h2>
        <div className="mb-4 flex">
          <button
            className={`py-2 px-4 rounded-md mr-2 ${!showRead ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => setShowRead(false)}
          >
            Unread ({initialMessages.unread.length})
          </button>
          <button
            className={`py-2 px-4 rounded-md ${showRead ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => setShowRead(true)}
          >
            Read ({initialMessages.read.length})
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {(showRead ? initialMessages.read : initialMessages.unread).map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-md ${showRead ? 'bg-gray-700' : 'bg-red-500'} text-white cursor-pointer`}
              onClick={() => handleCardClick(msg)}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Detailed Message Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white w-11/12 max-w-lg p-8 rounded-lg relative max-h-screen md:max-h-80 overflow-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={() => setSelectedMessage(null)}
              >
                <FaTimes className="text-2xl" />
              </button>
              <h2 className="text-xl font-bold mb-4">Message Details</h2>
              <p className="text-gray-700">{selectedMessage.text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationModal;
