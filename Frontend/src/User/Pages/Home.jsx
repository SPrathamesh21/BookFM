import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig'; 
import BookCarousel from '../Components/BookCarousel';
import '../../Style/BookCarousel.css';
import { AuthContext } from '../../Context/authContext';

function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const navigate = useNavigate(); 
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/get-books'); 
        const booksData = response.data;
        setBooks(booksData);

        const allCategories = booksData.flatMap(book => book.category);
        const uniqueCategories = [...new Set(allCategories)]; 
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const [libraryResponse, favoritesResponse] = await Promise.all([
            axios.get(`/get-user-library/${currentUser.userId}`),
            axios.get(`/get-favorites/${currentUser.userId}`)
          ]);

          const libraryBooks = libraryResponse.data;
          setUserLibrary(libraryBooks);
          console.log('libraybooks', libraryBooks)
          const favoriteBooksData = favoritesResponse.data.favorites;
          console.log('favoritesbooksData', favoriteBooksData)
          // Filter the favorite books to match the criteria
          const filteredFavoriteBooks = favoriteBooksData.filter(book => {
            const isBookInLibrary = libraryBooks.some(libBook => {
              // console.log('libbooks', libBook, libBook._id, book, book._id)
              libBook._id === book._id});
            return isBookInLibrary;
          });
          console.log('filterdataq', filteredFavoriteBooks)
          // Group by category and count books in each category
          const categoryCounts = {};
          filteredFavoriteBooks.forEach(book => {
            book.category.forEach(cat => {
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
          });

          // Only include books from categories with 5 or more books
          const filteredBooksByCategory = filteredFavoriteBooks.filter(book => 
            book.category.some(cat => categoryCounts[cat] >= 5)
          );

          // Check if there are at least 2 different categories
          const categoriesInFavorites = new Set(
            filteredBooksByCategory.flatMap(book => book.category)
          );

          if (categoriesInFavorites.size >= 2) {
            setFavoriteBooks(filteredBooksByCategory);
          } else {
            setFavoriteBooks([]);
          }

        } catch (error) {
          console.error('Error fetching user library or favorites:', error);
        }
      }
    };
    fetchUserLibrary();

  }, [currentUser]);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.toLowerCase()}`); 
  };

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col">
      {/* Categories Bar */}
      <section className="bg-gray-800 text-gray-100 p-4 overflow-x-auto whitespace-nowrap">
        {categories.map((category) => (
          <button
            key={category}
            className="inline-block px-4 py-2 mx-2 bg-gray-700 text-teal-400 rounded-full hover:bg-teal-400 hover:text-gray-900"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gray-900 py-16 text-center">
          <h1 className="text-[25px] md:text-5xl font-bold mb-6 text-teal-400">
            Discover Your Next Great Read
          </h1>
          <p className="text-lg mb-8">
            Explore a vast collection of ebooks <span className="inline-block md:hidden"><br /></span>from various genres.
          </p>
          <button className="bg-teal-400 text-gray-900 py-2 px-6 rounded-full text-lg font-semibold hover:bg-teal-300 animation-zoom transform transition-none hover:animate-none">
            Start Reading
          </button>
        </section>

        <BookCarousel books={userLibrary} title="Your Library" />
        {favoriteBooks.length >= 0 && (
          <BookCarousel books={favoriteBooks} title="Your Favorite Shelves" />
        )}
        <BookCarousel books={books} title="3d Books" />
        <BookCarousel books={books} title="4d Books" />
        <BookCarousel books={books} title="Best Seller" />
        <BookCarousel books={books} title="Recommended By Cabin" />
      </main>
    </div>
  );
}

export default Home;
