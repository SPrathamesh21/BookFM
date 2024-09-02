import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../assets/images/image.jfif';
import Image1 from '../../assets/images/image1.jfif';
import Image2 from '../../assets/images/image2.jfif';
import Image3 from '../../assets/images/image3.jfif';

const categories = [
  { name: 'Fiction', image: Image1 },
  { name: 'Non-Fiction', image: Image },
  { name: 'Science', image: Image2 },
  { name: 'Fantasy', image: Image3 },
  { name: 'Mystery', image: Image2 },
  // Add more categories as needed
];

function Discover() {
  return (
    <section className="bg-gray-900 py-16 px-4">
      <h2 className="text-3xl font-bold text-teal-400 text-center mb-8">Discover by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.name} 
            to={`/category/${category.name.toLowerCase()}`} 
            className="relative block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img src={category.image} alt={category.name} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center sm:opacity-0 sm:hover:opacity-100 transition-opacity duration-300">
              <span className="text-lg font-bold text-white tracking-wide">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Discover;
