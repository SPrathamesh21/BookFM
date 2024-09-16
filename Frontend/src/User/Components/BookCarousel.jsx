import { React, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../Style/BookCarousel.css';
import axios from '../../../axiosConfig'
import { AuthContext } from '../../Context/authContext';

const BookCarousel = ({ books, title }) => {
  const navigate = useNavigate();
  const [activeHearts, setActiveHearts] = useState({});
  const { currentUser } = useContext(AuthContext);

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };
  useEffect(() => {
    if (currentUser){
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`/get-favorites/${currentUser.userId}`);
        const favoriteBooks = response.data.favorites.reduce((acc, book) => {
          acc[book._id] = true;
          return acc;
        }, {});
        setActiveHearts(favoriteBooks);
      } catch (error) {
        console.error('Error fetching favorite books:', error);
      }
    };
    fetchFavorites();
  }
  }, [currentUser]);

  const toggleHeart = async (bookId) => {
    try {
      const isFavorite = !activeHearts[bookId];
      setActiveHearts((prevState) => ({
        ...prevState,
        [bookId]: isFavorite,
      }));
  
      const response = isFavorite 
        ? await axios.post('/add-favorite', { userId: currentUser.userId, bookId })
        : await axios.post('/remove-favorite', { userId: currentUser.userId, bookId });
  
      if (!response.data.success && response.data.message.includes('log in')) {
        alert('Please log in again to manage your favorites.');
        // Optionally, redirect to the login page
        navigate('/login');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <section className="w-full px-6 py-12">
    <h2 className="text-3xl font-semibold mb-8 text-teal-400">{title}</h2>
    <div className="flex overflow-x-auto space-x-4 pb-4">
      {books.map((book) => (
        <div
          key={book._id}
          className="flex-shrink-0 w-60 relative"
          onClick={() => handleBookClick(book._id)}
        >
          <div className="relative bg-gray-700 shadow-lg rounded-lg overflow-hidden transform transition-transform hover:scale-95 hover:shadow-2xl cursor-pointer flex flex-col justify-between">
            <img
              src={book.coverImages[0]}
              alt={book.bookName}
              className="w-full h-60 object-cover" loading="lazy"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-teal-400">
                {book.bookName}
              </h3>
              <p className="text-gray-400 mt-2">{book.author}</p>
            </div>
            <div
              className={`heart ${activeHearts[book._id] ? 'is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleHeart(book._id);
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </section>
  );
};

export default BookCarousel;
