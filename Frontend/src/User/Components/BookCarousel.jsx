import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../Style/BookCarousel.css';

const BookCarousel = ({ books }) => {
  const CustomPrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <button
        className={`${className} slick-prev p-0 bg-teal-500 hover:bg-teal-600 text-white rounded-full w-12 h-12 flex justify-center items-center shadow-lg transform hover:scale-110 transition-transform`}
        style={{ left: '-20px', zIndex: 10 }}
        onClick={onClick}
      >
        {/* You can add custom icon here */}
      </button>
    );
  };

  const CustomNextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <button
        className={`${className} slick-next bg-teal-500 hover:bg-teal-600 text-white rounded-full w-12 h-12 flex justify-center items-center shadow-lg transform hover:scale-110 transition-transform`}
        style={{ right: '-20px', zIndex: 10 }}
        onClick={onClick}
      >
        {/* You can add custom icon here */}
      </button>
    );
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <section className="w-full px-6 py-12">
      <h2 className="text-3xl font-semibold mb-8 text-teal-400">Featured Books</h2>
      <Slider {...settings}>
        {books.map((book) => (
          <div key={book.id} className="px-3">
            <div className="bg-gray-700 shadow-lg rounded-lg overflow-hidden transform transition-transform hover:scale-95 hover:shadow-2xl cursor-pointer z-10">
              <img src={book.cover} alt={book.title} className="w-full h-60 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-teal-400">{book.title}</h3>
                <p className="text-gray-400 mt-2">{book.author}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default BookCarousel;
