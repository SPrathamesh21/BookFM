import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { AuthContext } from '../../Context/authContext';
// Import the search icon from react-icons
import { FaSearch } from 'react-icons/fa';

function YourLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useContext(AuthContext);

  const fetchUserLibrary = async () => {
    try {
      const response = await axios.get(`/get-user-library/${currentUser?.userId}`);
      setBooks(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLibrary();
  }, [currentUser?.userId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBooks = books.filter(book =>
    book.bookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p className='flex justify-center items-center text-center min-h-screen text-gray-100 bg-gray-900'>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 p-8">
      {/* Flex container for title and search bar */}
      <div className="flex justify-between items-center mb-8">
        {/* Title "Your Library" */}
        <h1 className="text-4xl font-bold text-teal-400">Your Library</h1>

        {/* Search Bar with Icon */}
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

      {/* Display Filtered Books */}
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
    </div>
  );
}

export default YourLibrary;
