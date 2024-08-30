import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function Header() {
  return (
    <header className="bg-gray-900 text-gray-100 w-full p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold text-teal-400">
        BookFM
      </Link>

      {/* Search Bar */}
      <div className="relative w-1/3">
        <input
          type="text"
          placeholder="Search ebooks..."
          className="py-2 px-4 pl-10 rounded-md w-full bg-gray-700 text-gray-100 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400" />
      </div>

      <nav>
        <Link to="/" className="mx-3 hover:text-teal-400">
          Home
        </Link>
        <Link to="/browse" className="mx-3 hover:text-teal-400">
          Browse
        </Link>
        <Link to="/signup" className="mx-3 hover:text-teal-400">
          Sign Up
        </Link>
      </nav>
    </header>
  );
}

export default Header;
