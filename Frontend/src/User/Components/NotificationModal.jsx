import React, { useState, useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from '../../../axiosConfig';

function NotificationModal({ isOpen, onClose, notifications, setNotifications, loading, error }) {
  const [showRead, setShowRead] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCardClick = (message) => {
    setSelectedMessage(message);

    if (!showRead && !message.read) {
      axios.put(`/notifications/${message._id}`, { read: true })
        .then((response) => {
          if (response.data.success) {
            // Update the notifications state
            const updatedUnread = notifications.unread.filter((msg) => msg._id !== message._id);
            const updatedRead = [...notifications.read, { ...message, read: true }];
            setNotifications({ unread: updatedUnread, read: updatedRead });
          } else {
            console.error('Error updating notification status:', response.data.message);
          }
        })
        .catch((error) => {
          console.error('Error updating notification status:', error.response ? error.response.data : error.message);
        });
    }
  };

  const handleImageClick = (src) => {
    setExpandedImage(src);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-11/12 max-w-lg p-6 rounded-lg relative max-h-96 overflow-y-auto"
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FaTimes className="text-2xl text-red-500" />
        </button>
        <h2 className="text-xl font-bold mb-4">Notifications</h2>

        {loading && <p className='text-gray-900 animate-bounce'>Loading notifications...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="mb-4 flex">
              <button
                className={`py-2 px-4 rounded-md mr-2 ${!showRead ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                onClick={() => setShowRead(false)}
              >
                Unread ({notifications.unread.length})
              </button>
              <button
                className={`py-2 px-4 rounded-md ${showRead ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                onClick={() => setShowRead(true)}
              >
                Read ({notifications.read.length})
              </button>
            </div>

            {showRead ? (
              notifications.read.map((message) => (
                <div
                  key={message._id}
                  className={`p-4 mb-2 cursor-pointer rounded-md ${message.read ? 'bg-teal-500' : 'bg-green-400'}`}
                  onClick={() => handleCardClick(message)}
                >
                  <h3 className="text-lg font-semibold">{message.title}</h3>
                </div>
              ))
            ) : (
              notifications.unread.map((message) => (
                <div
                  key={message._id}
                  className={`p-4 mb-2 cursor-pointer rounded-md ${message.read ? 'bg-red-200' : 'bg-red-400'}`}
                  onClick={() => handleCardClick(message)}
                >
                  <h3 className="text-lg font-semibold">{message.title}</h3>
                </div>
              ))
            )}
          </>
        )}

        {/* Detailed Message Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white w-[550px] max-w-2xl p-8 rounded-lg relative h-[450px] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={() => setSelectedMessage(null)}
              >
                <FaTimes className="text-2xl text-red-500" />
              </button>
              <h2 className="text-xl font-bold mb-4">Title: {selectedMessage.title}</h2>
              <p className="text-gray-700 mb-4 break-words">Description: {selectedMessage.description}</p>
              <div className="grid grid-cols-2 gap-3"> {/* Two-column layout */}
                {selectedMessage.files && selectedMessage.files.map((file, index) => {
                  const fileType = file.split(';')[0].split(':')[1];
                  if (fileType.startsWith('image/')) {
                    return (
                      <img
                        key={index}
                        src={`data:${fileType};base64,${file.split(',')[1]}`}
                        alt="Attachment"
                        className="w-42 h-42 border border-gray-300 rounded-md mb-2 object-cover cursor-pointer"
                        onClick={() => handleImageClick(`data:${fileType};base64,${file.split(',')[1]}`)}
                      />
                    );
                  } else if (fileType.startsWith('application/pdf')) {
                    return (
                      <div key={index} className="mb-4">
                        <iframe
                          title={`PDF Preview ${index}`}
                          src={`data:application/pdf;base64,${file.split(',')[1]}`}
                          className="w-36 h-36 border border-gray-300 rounded-md"
                          frameBorder="0"
                        />
                        <button
                          onClick={() => {
                            const pdfWindow = window.open('', '_blank');
                            pdfWindow.document.write(`
                              <html>
                                <head>
                                  <title>PDF Preview</title>
                                </head>
                                <body>
                                  <iframe
                                    src="data:application/pdf;base64,${file.split(',')[1]}"
                                    style="width:100%; height:100vh;"
                                    frameborder="0"
                                  ></iframe>
                                </body>
                              </html>
                            `);
                            pdfWindow.document.close();
                          }}
                          className="text-teal-500 underline ml-2"
                        >
                          View PDF
                        </button>
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            </div>
          </div>
        )}

        {/* Expanded Image Modal */}
        {expandedImage && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg relative max-w-4xl max-h-4xl overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={handleCloseExpandedImage}
              >
                <FaTimes className="text-2xl text-red-500" />
              </button>
              <img
                src={expandedImage}
                alt="Expanded"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationModal;
