import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../axiosConfig'; // Adjust the path as needed

function Discover() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/get-books');
        const books = response.data;

        // Extract unique categories from books data
        const uniqueCategories = [...new Set(books.map(book => book.category))].map(category => {
          const book = books.find(book => book.category === category);
          return {
            name: category,
            image: book.coverImages[0],
          };
        });

        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <section className="bg-gray-900 py-16 px-4">
      <h2 className="text-3xl font-bold text-teal-400 text-center mb-8">Discover by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.name} 
            to={`/category/${category.name.toLowerCase()}`} // Navigate to the CategoryPage
            className="relative block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img src={category.image} alt={category.name} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-lg font-bold text-white tracking-wide">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Discover;
