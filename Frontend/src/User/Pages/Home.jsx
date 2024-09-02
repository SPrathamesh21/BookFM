import React from 'react';
import BookCarousel from '../Components/BookCarousel';

function Home() {
  const handleCategoryClick = (category) => {
    alert(`Selected category: ${category}`);
  };

  const books = [
    { id: 1, title: 'Book Title 1', author: 'Author Name', cover: 'https://via.placeholder.com/150' },
    { id: 2, title: 'Book Title 2', author: 'Author Name', cover: 'https://via.placeholder.com/150' },
    { id: 3, title: 'Book Title 3', author: 'Author Name', cover: 'https://via.placeholder.com/150' },
    { id: 4, title: 'Book Title 4', author: 'Author Name', cover: 'https://via.placeholder.com/150' },
    { id: 5, title: 'Book Title 5', author: 'Author Name', cover: 'https://via.placeholder.com/150' },
    { id: 6, title: 'Book Title 6', author: 'Author Name', cover: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col">

      {/* Categories Bar */}
      <section className="bg-gray-800 text-gray-100 p-4 overflow-x-auto whitespace-nowrap">
        {['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy'].map((category) => (
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
          <h1 className="text-5xl font-bold mb-6 text-teal-400">Discover Your Next Great Read</h1>
          <p className="text-xl mb-8">Explore a vast collection of ebooks from various genres.</p>
          <button className="bg-teal-400 text-gray-900 py-2 px-6 rounded-full text-lg font-semibold hover:bg-teal-300">
            Start Reading
          </button>
        </section>

        {/* Book Carousel Section */}
        <BookCarousel books={books} />
        <BookCarousel books={books} />
        <BookCarousel books={books} />
        <BookCarousel books={books} />
        <BookCarousel books={books} />
        <BookCarousel books={books} />
      </main>

    </div>
  );
}

export default Home;
