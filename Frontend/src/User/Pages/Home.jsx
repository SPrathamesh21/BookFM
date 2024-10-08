import React, { useEffect, useState, useContext, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { AuthContext } from '../../Context/authContext';
import { useInView } from 'react-intersection-observer';

// Lazy load BookCarousel
const BookCarousel = lazy(() => import('../Components/BookCarousel'));

function Home() {
  const [books, setBooks] = useState([]);
  const [sortBooks, setSortBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [filteredFavoriteBooks, setFilteredFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [categoriesWithBooks, setCategoriesWithBooks] = useState([]);

  const fetchBooksByCategory = async () => {
    try {
      const response = await axios.get('/get-books-by-category', {
        params: { page: 1, limit: 10 }
      });
      setCategoriesWithBooks(response.data);
    } catch (err) {
      console.error('Error fetching categories and books:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBooksByCategory();
  }, []);

  const processBooksData = (booksData, userLibraryData, favoritesData) => {
    // Sort books
    const sortedBooks = booksData.sort((a, b) => b.count - a.count);
    setBooks(booksData);
    setSortBooks(sortedBooks);

    // Categorize books
    const categoryCounts = booksData.reduce((acc, book) => {
      const categories = Array.isArray(book.category) ? book.category : [book.category];
      categories.forEach((cat) => {
        if (cat) acc[cat] = (acc[cat] || 0) + 1;
      });
      return acc;
    }, {});

    setCategories(Object.keys(categoryCounts));


    // User Library and Favorites
    setUserLibrary(userLibraryData);

    const filteredFavoriteBooks = favoritesData.filter(book =>
      userLibraryData.some(libBook => libBook._id === book._id)
    );

    const categoryCountsFavorites = {};
    filteredFavoriteBooks.forEach(book => {
      book.category.forEach(cat => {
        categoryCountsFavorites[cat] = (categoryCountsFavorites[cat] || 0) + 1;
      });
    });

    const filteredBooksByCategory = filteredFavoriteBooks.filter(book =>
      book.category.some(cat => categoryCountsFavorites[cat] >= 5)
    );

    const categoriesInFavorites = new Set(
      filteredBooksByCategory.flatMap(book => book.category)
    );

    if (categoriesInFavorites.size >= 2) {
      setFavoriteBooks(filteredBooksByCategory);
    } else {
      setFavoriteBooks([]);
    }
  };

  const fetchBooks = async () => {
    try {
      // Fetch new data
      const [booksResponse, userLibraryResponse, favoritesResponse] = await Promise.all([
        axios.get('/get-books', {
          params: { page: 1, limit: 15 }
        }),
        currentUser ? axios.get(`/get-user-library/${currentUser.userId}`, {
          params: { page: 1, limit: 15 }
        }) : Promise.resolve({ data: [] }),
        currentUser ? axios.get(`/get-favorites/${currentUser.userId}`, {
          params: { page: 1, limit: 15 }
        }) : Promise.resolve({ data: { favorites: [] } })
      ]);

      const booksData = booksResponse.data;
      const userLibraryData = userLibraryResponse.data;
      const favoritesData = favoritesResponse.data.favorites;

      processBooksData(booksData, userLibraryData, favoritesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentUser?.userId]);

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (currentUser && currentUser.userId) {
        try {
          // Fetch user library, favorites, and all books
          const [libraryResponse, favoritesResponse, booksResponse] = await Promise.all([
            axios.get(`/get-user-library/${currentUser.userId}`, {
              params: { page: 1, limit: 15 }
            }),
            axios.get(`/get-favorites/${currentUser.userId}`, {
              params: { page: 1, limit: 15 }
            }),
            axios.get(`/get-books`, {
              params: { page: 1, limit: 15 }
            })
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

          // Only include books from categories with at least 5 books in the books model
          const filteredBooksByCategory = filteredFavoriteBooks.filter(book => {
            const categories = Array.isArray(book.category) ? book.category : [book.category];
            return categories.some(cat => categoryCounts[cat] >= 5);
          });

          // Ensure there are at least 2 different categories
          const categoriesInFavorites = new Set(
            filteredBooksByCategory.flatMap(book => {
              const categories = Array.isArray(book.category) ? book.category : [book.category];
              return categories;
            })
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

  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      try {
        const response = await axios.get('/get-recommended-books', {
          params: { page: 1, limit: 15 }
        });
        setRecommendedBooks(response.data);
      } catch (error) {
        console.error('Error fetching recommended books:', error);
      }
    };

    fetchRecommendedBooks();
  }, []); 

  useEffect(() => {
    const fetchFilteredFavoriteBooks = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const response = await axios.get(`/get-filtered-favorite-books/${currentUser.userId}`, {
            params: { page: 1, limit: 15 }
          });
          if (response.data.success) {
            setFilteredFavoriteBooks(response.data.favorites);
            console.log('setefafafa', response.data.favorites)
          } else {
            console.error('Failed to fetch favorite books:', response.data.message);
          }
        } catch (error) {
          console.error('Error fetching favorite books:', error);
        }
      }
    };

    fetchFilteredFavoriteBooks();
  }, [currentUser?.userId]);

  if (loading) {
    return  (
      <div className="loading-container bg-gray-800 flex justify-center items-center text-center min-h-screen">
  <div>
    <div className="w-12 h-12 border-4 border-t-4 border-white border-opacity-60 border-t-teal-500 rounded-full animate-spin"></div>
    <p className="text-white mt-4">Loading...</p>
  </div>
</div>
);
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

        <div className="flex items-center justify-between">
          <Suspense fallback={<div>Loading carousel...</div>}>
            <BookCarousel
              books={userLibrary.slice(0, 5)}
              title={
                <div className="flex justify-between w-full items-center">
                  Your Library
                  <button
                    onClick={() => navigate('/yourlibrary')}
                    className="ml-2 text-teal-400 hover:text-teal-600 text-sm font-semibold cursor-pointer border border-2 rounded-full border-teal-400 px-4 py-2"
                  >
                    See All
                  </button>
                </div>
              }
            />
          </Suspense>
        </div>

        {/* Favorites Carousel */}
        {filteredFavoriteBooks.length > 0 && (
          <Suspense fallback={<div>Loading favorites...</div>}>
            <BookCarousel books={filteredFavoriteBooks} title="Your Favorites" />
          </Suspense>
        )}

      {/* 3rd Carousel*/}
      <div>
      {categoriesWithBooks.map((category) => (
        <div key={category._id} className="flex items-center justify-between">
          <BookCarousel
            books={category.books} 
            title={
              <div className="flex justify-between w-full items-center">
                {category._id} Books  
                <button
                  onClick={() => navigate(`/ThirdCarousel?category=${category._id}`)}
                  className="ml-2 text-teal-400 hover:text-teal-600 text-sm font-semibold cursor-pointer border border-2 rounded-full border-teal-400 px-4 py-2"
                >
                  See All
                </button>
              </div>
            }
          />
        </div>
      ))}
    </div>
        {/* 4th Carousel */}
        {/* <div className="flex items-center justify-between">
          <Suspense fallback={<div>Loading 4D books...</div>}>
            <BookCarousel
              books={books.filter(book => book.category.includes(carouselCategories.category4D))}
              title={
                <div className="flex justify-between w-full items-center">
                  {carouselCategories.category4D} Books
                  <button
                   onClick={() => navigate(`/ThirdCarousel?category=${carouselCategories.category4D}`)}
                    className="ml-2 text-teal-400 hover:text-teal-600 text-sm font-semibold cursor-pointer border border-2 rounded-full border-teal-400 px-4 py-2"
                  >
                    See All
                  </button>
                </div>
              }
            />
          </Suspense>
        </div> */}

        {/* Most Read Books */}
        <div className="flex items-center justify-between">
          <Suspense fallback={<div>Loading best sellers...</div>}>
            <BookCarousel
              books={sortBooks}
              title={
                <div className="flex justify-between w-full items-center">
                  Most-Read Books
                  <button
                    onClick={() => navigate('/mostreadbooks')}
                    className="ml-2 text-teal-400 hover:text-teal-600 text-sm font-semibold cursor-pointer border border-2 rounded-full border-teal-400 px-4 py-2"
                  >
                    See All
                  </button>
                </div>
              }
            />
          </Suspense>
        </div>

      <div className="flex items-center justify-between">
          <Suspense fallback={<div>Loading recommendations...</div>}>
            <BookCarousel
              books={recommendedBooks}
              title={
                <div className="flex justify-between w-full items-center">
                  Recommended By Cabin
                  <button
                  onClick={() => navigate('/recommendedbycabin')}
                    className="ml-2 text-teal-400 hover:text-teal-600 text-sm font-semibold cursor-pointer border border-2 rounded-full border-teal-400 px-4 py-2"
                  >
                    See All
                  </button>
                </div>
              }
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default Home;
