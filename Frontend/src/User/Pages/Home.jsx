import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import BookCarousel from '../Components/BookCarousel';
import '../../Style/BookCarousel.css';
import { AuthContext } from '../../Context/authContext';

function Home() {
  const [books, setBooks] = useState([]);
  const [sortBooks, setSortBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [carouselCategories, setCarouselCategories] = useState({ category3D: '', category4D: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // Function to randomly select a category with at least 5 books
  const getRandomCategory = (categoriesWithCount, excludeCategory = null) => {
    const validCategories = Object.keys(categoriesWithCount).filter(
      (cat) => categoriesWithCount[cat] >= 5 && cat !== excludeCategory
    ); 
    return validCategories[Math.floor(Math.random() * validCategories.length)];
  };

  // Combined data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all necessary data
        const [booksResponse, userLibraryResponse, favoritesResponse] = await Promise.all([
          axios.get('/get-books'),
          currentUser ? axios.get(`/get-user-library/${currentUser.userId}`) : Promise.resolve({ data: [] }),
          currentUser ? axios.get(`/get-favorites/${currentUser.userId}`) : Promise.resolve({ data: { favorites: [] } })
        ]);

        const booksData = booksResponse.data;
        const userLibraryData = userLibraryResponse.data;
        const favoriteBooksData = favoritesResponse.data.favorites;

        // Update state
        setBooks(booksData);
        setUserLibrary(userLibraryData);

        // Sorting books
        const sortedBooks = booksData.sort((a, b) => b.count - a.count);
        setSortBooks(sortedBooks);

        // Category counting
        const categoryCounts = booksData.reduce((acc, book) => {
          const categories = Array.isArray(book.category) ? book.category : [book.category];
          categories.forEach((cat) => {
            if (cat) acc[cat] = (acc[cat] || 0) + 1;
          });
          return acc;
        }, {});

        const uniqueCategories = Object.keys(categoryCounts);
        setCategories(uniqueCategories);

        // Random category selection
        const category3D = getRandomCategory(categoryCounts);
        const category4D = getRandomCategory(categoryCounts, category3D);
        setCarouselCategories({ category3D, category4D });

        // Filtering favorite books
        const filteredFavoriteBooks = favoriteBooksData.filter(book =>
          userLibraryData.some(libBook => libBook._id === book._id)
        );

        // Group by category and filter
        const categoryCountsFavorites = filteredFavoriteBooks.reduce((acc, book) => {
          book.category.forEach(cat => {
            acc[cat] = (acc[cat] || 0) + 1;
          });
          return acc;
        }, {});

        const filteredBooksByCategory = filteredFavoriteBooks.filter(book =>
          book.category.some(cat => categoryCountsFavorites[cat] >= 5)
        );

        // Ensure at least 2 different categories
        const categoriesInFavorites = new Set(
          filteredBooksByCategory.flatMap(book => book.category)
        );

        if (categoriesInFavorites.size >= 2) {
          setFavoriteBooks(filteredBooksByCategory);
        } else {
          setFavoriteBooks([]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.toLowerCase()}`);
  };

  const recommendedBooks = useMemo(() => {
    return books.filter(book => book.recommendedByCabin === 'Yes');
  }, [books]);

  if (loading) {
    return <div className="flex justify-center items-center text-center bg-gray-800 text-gray-100 min-h-screen">
      Loading...
    </div>;
  }

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

        {/* User's Library Carousel */}
        <BookCarousel books={userLibrary} title="Your Library" />

        {favoriteBooks.length > 0 && (
          <BookCarousel books={favoriteBooks} title="Your Favorite Shelves" />
        )}

        {/* 3D Books Carousel */}
        {carouselCategories.category3D && (
          <BookCarousel
            books={books.filter(book =>
              book.category.includes(carouselCategories.category3D)
            )}
            title={`${carouselCategories.category3D} Books`}
          />
        )}

        {/* 4D Books Carousel */}
        {carouselCategories.category4D && (
          <BookCarousel
            books={books.filter(book =>
              book.category.includes(carouselCategories.category4D)
            )}
            title={`${carouselCategories.category4D} Books`}
          />
        )}

        <BookCarousel books={sortBooks} title="Best Seller" />

        {/* Recommended By Cabin Carousel */}
        <BookCarousel
          books={recommendedBooks}
          title="Recommended By Cabin"
        />
      </main>
    </div>
  );
}

export default Home;