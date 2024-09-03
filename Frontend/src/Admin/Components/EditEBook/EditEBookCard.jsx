import React, { useEffect, useRef, useState } from 'react';
import { FaEdit } from 'react-icons/fa'; // Import the edit icon

const EditBookCard = ({ book, onCardClick, onEditClick }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.8 // 80% of the card needs to be visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="card max-w-xs mx-auto md:h-[300px] w-[180px] bg-gradient-to-r from-green-500 to-blue-400 text-white mt-3 rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105 cursor-pointer hover:from-green-600 hover:to-blue-600 relative"
      onClick={() => onCardClick(book._id)}
    >
      {/* Display cover image */}
      {book.coverImages.length > 0 && (
        <img
          src={`${book.coverImages[0]}`} // Assuming the first image is the cover
          alt={book.bookName}
          className="h-[150px] md:h-[220px] w-full object-cover"
        />
      )}
      <div className="p-2 mb-3 h-9">
        <h3 className="text-[12px] text-white md:text-lg font-bold truncate"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {book.bookName}
        </h3>
        <p className="text-[10px] md:text-lg text-white truncate"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {book.category}
          {book.pricing === 'Premium' && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs md:text-sm font-bold px-2 py-1 rounded-sm shadow-md transform">
              Premium
            </div>
          )}
        </p>
      </div>
      <div
        className="absolute top-2 right-2 text-2xl cursor-pointer transition-transform transform hover:scale-125"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the onCardClick
          onEditClick(book._id);
        }}
      >
        <FaEdit /> {/* Edit Icon */}
      </div>
    </div>
  );
};

export default EditBookCard;
