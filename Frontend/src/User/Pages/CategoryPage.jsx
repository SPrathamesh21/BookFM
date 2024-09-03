import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../../axiosConfig'; 

function CategoryPage() {
  const { categoryName } = useParams(); 
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/get-books');
        const allBooks = response.data;

        const filteredBooks = allBooks.filter(book => book.category.toLowerCase() === categoryName.toLowerCase());
        setBooks(filteredBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 p-8">
      <h1 className="text-4xl font-bold text-teal-400 mb-8">{categoryName}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.map((book) => (
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
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
