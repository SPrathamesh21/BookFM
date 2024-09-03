import React, { useState, useEffect, useRef } from 'react';
import EditBookCard from '../EditEBook/EditEBookCard'; // Import the EditBookCard component
import axios from '../../../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const EditBookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const containerRef = useRef(null);
  const loadedBookIds = useRef(new Set());
  const navigate = useNavigate();

  // Fetch books
  const fetchBooks = async (limit) => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/books/get_edit_data', {
        params: { offset, limit }
      });

      const { bookList, hasMore: moreBooksAvailable } = response.data;

      const newBooks = bookList.filter(book => !loadedBookIds.current.has(book._id));
      newBooks.forEach(book => loadedBookIds.current.add(book._id));

      setBooks(prev => [...prev, ...newBooks]);
      setHasMore(moreBooksAvailable);
      setOffset(prevOffset => prevOffset + newBooks.length);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions for the search bar
  const fetchSuggestions = async (query) => {
    if (query.trim() !== '') {
      try {
        const response = await axios.get('/api/books/search', { // Ensure this endpoint is correct
          params: { query }
        });
        setSearchSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  // Debounce search suggestions fetch
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300); // Adjust debounce delay as needed

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setActiveSuggestionIndex(-1); // Reset active suggestion on input change
  };

  // Handle clear search input
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (id) => {
    navigate(`/admin_panel/EditEBook/${id}`);
    setSearchSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  // Handle keydown events for keyboard navigation
  const handleKeyDown = (event) => {
    if (searchSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveSuggestionIndex(prevIndex => 
          Math.min(prevIndex + 1, searchSuggestions.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveSuggestionIndex(prevIndex => 
          Math.max(prevIndex - 1, 0)
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(searchSuggestions[activeSuggestionIndex]._id);
        }
        break;
      case 'Escape':
        setSearchSuggestions([]);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Initial load of the first 20 books
  useEffect(() => {
    fetchBooks(20);
  }, []);

  // Handle scroll event for infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
        fetchBooks(10);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, loading]);

  const handleEditClick = (id) => {
    navigate(`/admin_panel/EditEBook/${id}`);
  };

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div 
      ref={containerRef} 
      style={{ height: '100vh', overflowY: 'auto' }}
      tabIndex="0" 
      onKeyDown={handleKeyDown} // Handle key down events for keyboard navigation
    >
      {/* Search Bar */}
      <div className='max-w-lg mx-auto relative mt-4'>
        <div className="relative flex items-center w-full h-12 rounded-lg bg-white overflow-hidden border-2 border-black shadow-sm">
          <div className="grid place-items-center h-full w-12 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 pl-3"
            type="text"
            id="search"
            placeholder="Search books..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              className="absolute right-0 top-0 mt-3 mr-3 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9l-2-2a1 1 0 111.414-1.414L10 6.586l1.586-1.586a1 1 0 111.414 1.414L11.414 9l1.586 1.586a1 1 0 11-1.414 1.414L10 10.414l-1.586 1.586a1 1 0 11-1.414-1.414L8.586 9l-1.586-1.586a1 1 0 011.414-1.414L10 9z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {searchSuggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white text-black rounded-md shadow-lg z-10 border-2 border-black">
            {searchSuggestions.map((suggestion, index) => (
              <div
                key={suggestion._id}
                className={`cursor-pointer px-4 py-2 ${index === activeSuggestionIndex ? 'bg-gray-200' : ''} hover:bg-gray-200 transition-colors duration-150 transform hover:scale-105 active:scale-95`}
                onClick={() => handleSuggestionClick(suggestion._id)}
              >
                <span className="font-bold">{suggestion.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 ml-5 mt-[100px]">
        {books.map(book => (
          <EditBookCard
            key={book._id}
            book={book}
            onEditClick={() => handleEditClick(book._id)}
          />
        ))}
      </div>
      {loading && <p>Loading more...</p>}
    </div>
  );
};

export default EditBookList;
