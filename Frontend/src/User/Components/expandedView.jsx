import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

const ExpandedView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate(); 
  const [book, setBook] = useState(null);

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

  if (!book) return <div>Loading...</div>;

  return (
    <div className="flex flex-row p-8 rounded-xl bg-gradient-to-r from-gray-200 to-white max-w-3xl mx-auto my-5 shadow-lg transform transition-transform ease-linear cursor-pointer overflow-hidden relative">
      <img 
        src={book.coverImages[0]} 
        alt={book.bookName} 
        className="w-72 h-96 mr-8 rounded-xl object-cover transition-transform duration-300 ease-in-out" 
      />
      <div className="flex flex-col justify-center max-w-[calc(100%-350px)]">
        <h2 className="text-4xl font-bold mb-3 text-gray-800" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}>
          {book.bookName}
        </h2>
        <h4 className="text-2xl italic mb-4 text-gray-600">by {book.author}</h4>
        <p className="text-lg mb-5 text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
          {book.description}
        </p>
        <p className="text-base text-gray-600">Usual time to read: 5 hours</p>
      </div>
      <button 
        onClick={() => navigate(-1)} // Use navigate(-1) to go back to the previous page
        className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        &times;
      </button>
    </div>
  );
};

export default ExpandedView;
