import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig'; // Adjust the path if necessary
import BookCarousel from '../Components/BookCarousel';
import '../../Style/BookCarousel.css';

function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/get-books'); 
        const booksData = response.data;
        // console.log('book data', booksData)
        setBooks(booksData);
        const allCategories = booksData.flatMap(book => book.category);
        const uniqueCategories = [...new Set(allCategories)]; 

        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.toLowerCase()}`); // Navigate to the category page
  };

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

        {/* Book Carousel Section */}
        <BookCarousel books={books} />
      </main>
    </div>
  );
}

export default Home;
