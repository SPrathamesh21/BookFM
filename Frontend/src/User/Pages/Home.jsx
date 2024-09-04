import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig'; 
import BookCarousel from '../Components/BookCarousel';
import '../../Style/BookCarousel.css';
import { AuthContext } from '../../Context/authContext';

function Home() {
  const [books, setBooks] = useState([]);
  const [sortBooks, setSortBooks] = useState([])
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
        // Sort books by count in descending order (highest count first)
        const sortedBooks = booksData.sort((a, b) => b.count - a.count);
        setSortBooks(sortedBooks);

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
          // Fetch user library, favorites, and all books
          const [libraryResponse, favoritesResponse, booksResponse] = await Promise.all([
            axios.get(`/get-user-library/${currentUser.userId}`),
            axios.get(`/get-favorites/${currentUser.userId}`),
            axios.get(`/get-books`)
          ]);
  
          const libraryBooks = libraryResponse.data;
          const favoriteBooksData = favoritesResponse.data.favorites;
          const allBooks = booksResponse.data;
  
          setUserLibrary(libraryBooks);
  
          // Count books in each category from the books model
          const categoryCounts = {};
          allBooks.forEach(book => {
            const categories = Array.isArray(book.category) ? book.category : [book.category];
            categories.forEach(cat => {
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
          });
  
          // Filter favorite books that are in the user library
          const filteredFavoriteBooks = favoriteBooksData.filter(book =>
            libraryBooks.some(libBook => libBook._id === book._id)
          );
          console.log('filterbooks', filteredFavoriteBooks)
          // Only include books from categories with at least 5 books in the books model
          const filteredBooksByCategory = filteredFavoriteBooks.filter(book => {
            const categories = Array.isArray(book.category) ? book.category : [book.category];
            return categories.some(cat => categoryCounts[cat] >= 5);
          });
          console.log('filtered', filteredBooksByCategory)
          // Ensure there are at least 2 different categories
          const categoriesInFavorites = new Set(
            filteredBooksByCategory.flatMap(book => {
              const categories = Array.isArray(book.category) ? book.category : [book.category];
              return categories;
            })
          );
          console.log('categoryinfav', categoriesInFavorites)
          if (categoriesInFavorites.size >= 2) {
            console.log('hdf')
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
        {favoriteBooks.length > 0 && (
          <BookCarousel books={favoriteBooks} title="Your Favorite Shelves" />
        )}
        <BookCarousel books={books} title="3d Books" />
        <BookCarousel books={books} title="4d Books" />
        <BookCarousel books={sortBooks} title="Best Seller" />
        <BookCarousel books={books} title="Recommended By Cabin" />
      </main>
    </div>
  );
}

export default Home;
