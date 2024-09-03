import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim().length > 0) {
        try {
          const response = await axios.get('/search-ebooks', {
            params: { query }
          });
          setSuggestions(response.data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchData();
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (bookId) => {
    navigate(`/book/${bookId}`);
    setSuggestions([]);
    setQuery('')
  };

  return (
    <div className="relative flex-grow max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search ebooks..."
        className="py-2 px-4 pl-10 rounded-md w-full bg-gray-700 text-gray-100 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400" />

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute top-full mt-2 w-full bg-gray-800 text-gray-100 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
          {suggestions.slice(0, 10).map((suggestion) => (
            <li 
              key={suggestion._id} 
              className="p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion._id)} 
            >
              {suggestion.bookName} by {suggestion.author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
