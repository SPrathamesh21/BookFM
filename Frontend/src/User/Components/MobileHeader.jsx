import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function MobileHeader() {
  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 shadow-md">
      
      {/* First Row: Logo and Browse */}
      <div className="flex justify-between items-center mb-4">
        <Link to="/" className="text-2xl font-bold text-teal-400">
          BookFM
        </Link>
        <Link to="/browse" className="text-lg text-teal-400">
          Browse
        </Link>
      </div>

      {/* Second Row: Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search ebooks..."
          className="py-2 px-4 pl-10 rounded-md w-full bg-gray-700 text-gray-100 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400" />
      </div>

    </header>
  );
}

export default MobileHeader;
