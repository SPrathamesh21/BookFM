import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import MobileHeader from '../Components/MobileHeader';
function Home() {
  const handleCategoryClick = (category) => {
    // Logic to filter and render books by category
    alert(`Selected category: ${category}`);
  };
  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col">


        {/* Categories Bar */}
        <section className="bg-gray-800 text-gray-100 p-4 overflow-x-auto whitespace-nowrap">
        {["Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", "Fantasy"].map((category) => (
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

        {/* Featured Books Section */}
        <section className="w-full max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-semibold mb-8 text-teal-400">Featured Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((book) => (
              <div key={book} className="bg-gray-700 shadow-lg rounded-lg overflow-hidden">
                <img src={`https://via.placeholder.com/150`} alt={`Book ${book}`} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-teal-400">Book Title {book}</h3>
                  <p className="text-gray-400 mt-2">Author Name</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>


    </div>
  );
}

export default Home;
