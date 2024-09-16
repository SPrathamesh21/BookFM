import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { AuthContext } from '../../Context/authContext';
import { FaSearch } from 'react-icons/fa';

function YourLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = React.useContext(AuthContext);

  const fetchBooks = useCallback(async (pageNum) => {
    setLoading(true); // Start loading animation
    try {
      const response = await axios.get(`/get-user-library/${currentUser?.userId}`, {
        params: { page: pageNum, limit: 10 } // Adjust limit as needed
      });

      if (response.data.length > 0) {
        // Ensure no duplicates and append new data
        setBooks(prevBooks => {
          const existingIds = new Set(prevBooks.map(book => book._id));
          const newBooks = response.data.filter(book => !existingIds.has(book._id));
          return [...prevBooks, ...newBooks];
        });
        setHasMore(response.data.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    fetchBooks(page);
  }, [page, fetchBooks]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBooks = books.filter(book =>
    book.bookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && page === 1) {
    return <p className='flex justify-center items-center text-center min-h-screen text-gray-100 bg-gray-900'>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-teal-400">Your Library</h1>
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-teal-400" />
          <input
            type="text"
            placeholder="Search by book name or author..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 p-2 w-full max-w-xl text-gray-100 placeholder-teal-400 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <Link
              key={book._id}
              to={`/book/${book._id}`}
              className="bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300"
            >
              <img
                src={book.coverImages[0]}
                alt={book.bookName}
                className="w-full h-40 object-cover mb-4 rounded"
              />
              <h2 className="text-xl text-teal-400 font-bold mb-2">{book.bookName}</h2>
              <p className="text-sm text-gray-400">{book.author}</p>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-400">No books found.</p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center mt-8">
          <div className="w-12 h-12 border-4 border-t-4 border-white border-opacity-80 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default YourLibrary;
