import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { FaShareAlt, FaBookOpen } from 'react-icons/fa';

const ExpandedView = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [isHover, setIsHover] = useState(false);
  const [isReadHover, setIsReadHover] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`/get-book/${bookId}`);
        setBook(response.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: book?.bookName || 'Book Name',
        text: `Check out this book: ${book?.bookName || 'Book Name'}!`,
        url: url,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  if (!book) return <div>Loading...</div>;

  return (
    <div className="flex flex-row p-8 rounded-xl bg-gradient-to-r from-gray-200 to-white max-w-3xl mx-auto my-5 shadow-lg transform transition-transform ease-linear cursor-pointer overflow-hidden relative">
      <button 
        className={`absolute top-2 right-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-md transition-colors duration-300 ${isHover ? 'bg-blue-700 shadow-lg' : ''}`}
        onClick={handleShare}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <FaShareAlt size={20} />
      </button>
      <img 
        src={book.coverImages[0]} 
        alt={book.bookName} 
        className="w-72 h-96 mr-8 rounded-xl object-cover transition-transform duration-300 ease-in-out" 
      />
      <div className="flex flex-col justify-center w-full">
        <h2 className="text-4xl font-bold mb-3 text-gray-800" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}>
          {book.bookName}
        </h2>
        <h4 className="text-2xl italic mb-4 text-gray-600">by {book.author}</h4>
        <p className="text-lg mb-5 text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
          Book Description: <span><br/></span>{book.description}
        </p>
        <p className="text-base text-gray-600">Usual time to read: 5 hours</p>
        <button 
          className={`mt-5 py-2 px-4 bg-blue-500 text-white rounded-lg font-bold text-lg flex items-center justify-center transition-transform duration-300 ${isReadHover ? 'bg-blue-700 transform scale-110' : ''} w-full`}
          onMouseEnter={() => setIsReadHover(true)}
          onMouseLeave={() => setIsReadHover(false)}
        >
          <FaBookOpen size={18} className="mr-2" />
          Read
        </button>
      </div>
    </div>
  );
};

export default ExpandedView;
