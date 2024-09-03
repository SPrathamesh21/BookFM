import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { FaShareAlt, FaBookOpen } from 'react-icons/fa';

const ExpandedView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate(); 
  const [book, setBook] = useState(null);
  const [isHover, setIsHover] = useState(false);
  const [isReadHover, setIsReadHover] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`/get-book/${bookId}`);
        console.log('Book details fetched:', response.data);
        setBook(response.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  useEffect(() => {
    if (book && book.coverImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % book.coverImages.length);
      }, 3000); // Change image every 3 seconds
  
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [book]);

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

  if (!book) return <div className="text-center text-gray-700">Loading...</div>;

  return (
    <div className="relative flex flex-col md:flex-row p-6 md:p-8 rounded-xl bg-gradient-to-r from-gray-100 to-white max-w-4xl mx-auto my-5 shadow-lg transform transition-transform ease-linear cursor-pointer overflow-hidden">
      {/* Fixed share button */}
      <button 
        className={`fixed top-5 right-5 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-md transition-colors duration-300 ${isHover ? 'bg-blue-700 shadow-lg' : ''}`}
        onClick={handleShare}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        aria-label="Share"
      >
        <FaShareAlt size={24} />
      </button>

      {/* Auto-scrolling image carousel */}
      <div className="w-64 h-96 md:w-96 md:h-96 mr-0 md:mr-8 rounded-xl overflow-hidden relative">
        {book.coverImages && book.coverImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`${book.bookName} cover ${index + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            onError={() => console.error(`Failed to load image: ${image}`)}
          />
        ))}
      </div>

      <div className="flex flex-col justify-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}>
          {book.bookName}
        </h2>
        <h4 className="text-xl md:text-2xl italic mb-4 text-gray-600">by {book.author}</h4>
        <p className="text-base md:text-lg mb-5 text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
          Book Description: <span><br/></span>{book.description}
        </p>
        <p className="text-base md:text-lg text-gray-600 mb-5">Usual time to read: 5 hours</p>
        <button 
          className={`mt-4 md:mt-5 py-2 px-4 bg-blue-500 text-white rounded-lg font-bold text-lg flex items-center justify-center transition-transform duration-300 ${isReadHover ? 'bg-blue-700 transform scale-105' : ''} w-full md:w-auto`}
          onMouseEnter={() => setIsReadHover(true)}
          onMouseLeave={() => setIsReadHover(false)}
        >
          <FaBookOpen size={20} className="mr-2" />
          Read
        </button>
      </div>
    </div>
  );
};

export default ExpandedView;


