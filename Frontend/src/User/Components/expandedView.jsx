import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { FaShareAlt, FaBookOpen } from 'react-icons/fa';
import { AuthContext } from '../../Context/authContext';

const ExpandedView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isHover, setIsHover] = useState(false);
  const [isReadHover, setIsReadHover] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeHearts, setActiveHearts] = useState({});
  const [epubFile, setEpubFile] = useState(null);
  const [fileType, setFileType] = useState(null); 
  const { currentUser } = useContext(AuthContext);
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`/get-book/${bookId}`);
        setBook(response.data);
        if (response.data.EPUBbase64.id) {
          const fileId = response.data.EPUBbase64.id;
          const fileResponse = await axios.get(`/file/${fileId}`, { responseType: 'blob' });
          
          const filename = response.data.EPUBbase64.filename;
          const fileExtension = filename.split('.').pop(); // Extract the file extension
          const fileType = fileExtension === 'epub' ? 'epub' : fileExtension === 'pdf' ? 'pdf' : 'unknown'; // Set file type based on extension
  
          const blob = fileResponse.data;
          const base64 = await blobToBase64(blob);
          localStorage.setItem('epubFileData', base64);
          localStorage.setItem('fileType', fileType);
          setEpubFile(URL.createObjectURL(blob));
          setFileType(fileType); // Set the dynamic file type
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };
  
    fetchBookDetails();
  }, [bookId]);
  

  useEffect(() => {
    if (book && book.coverImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % book.coverImages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [book]);

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: book?.bookName || 'Book Name',
        text: `Check out this book: ${book?.bookName || 'Book Name'}!`,
        url: url,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const addToLibrary = async () => {
    if (!currentUser || !currentUser.userId) {
      alert('You need to log in to add this book to your library.');
      return;
    }

    try {
      const response = await axios.post('/add-to-library', { userId: currentUser.userId, bookId });
      if (response) {
        navigate('/documentviewer', {
          state: {
            fileUrl: localStorage.getItem('epubFileData'),
            fileType: localStorage.getItem('fileType'),
            BookID: bookId
          },
        });
      } else {
        navigate('/documentviewer');
      }
    } catch (error) {
      console.error('Error adding book to library:', error);
      alert('Failed to add book to library.');
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      const fetchFavorites = async () => {
        try {
          const response = await axios.get(`/get-favorites/${currentUser.userId}`);
          const favoriteBooks = response.data.favorites.reduce((acc, book) => {
            acc[book._id] = true;
            return acc;
          }, {});
          setActiveHearts(favoriteBooks);
        } catch (error) {
          console.error('Error fetching favorite books:', error);
        }
      };
      fetchFavorites();
    }
  }, [currentUser]);

  const toggleHeart = async (bookId) => {
    try {
      const isFavorite = !activeHearts[bookId];
      setActiveHearts((prevState) => ({
        ...prevState,
        [bookId]: isFavorite,
      }));

      const response = isFavorite 
        ? await axios.post('/add-favorite', { userId: currentUser.userId, bookId })
        : await axios.post('/remove-favorite', { userId: currentUser.userId, bookId });

      if (!response.data.success && response.data.message.includes('log in')) {
        alert('Please log in again to manage your favorites.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (!book) return <div className="flex justify-center items-center text-center bg-gray-800 text-gray-100 min-h-screen">Loading...</div>;

  return (
    <div className="relative flex flex-col md:flex-row p-6 md:p-8 rounded-xl bg-gradient-to-r from-gray-100 to-white max-w-4xl mx-auto my-5 shadow-lg transform transition-transform ease-linear cursor-pointer overflow-hidden">
      <button 
        className={`fixed top-5 right-5 bg-blue-500 text-white rounded-full w-12 h-12 z-10 flex items-center justify-center cursor-pointer shadow-md transition-colors duration-300 ${isHover ? 'bg-blue-700 shadow-lg' : ''}`}
        onClick={handleShare}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        aria-label="Share"
      >
        <FaShareAlt size={24} />
      </button>

      {/* Main image display */}
      <div className="w-full md:w-1/3 h-96 rounded-xl overflow-hidden relative">
        {book.coverImages && book.coverImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`${book.bookName} cover ${index + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            onError={() => console.error(`Failed to load image: ${image}`)}
          />
        ))}
        <div
          className={`heart ${activeHearts[book._id] ? 'is-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleHeart(book._id);
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between w-full md:w-2/3 md:pl-8">
        {/* Thumbnail carousel */}
        <div className="flex mt-4 md:mt-0">
          {book.coverImages && book.coverImages.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`${book.bookName} thumbnail ${index + 1}`} 
              className={`w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover m-1 cursor-pointer transition-opacity duration-300 ${index === currentImageIndex ? 'opacity-100' : 'opacity-50'}`}
              onClick={() => handleThumbnailClick(index)}
              onError={() => console.error(`Failed to load thumbnail: ${image}`)}
            />
          ))}
        </div>

        {/* Book Details */}
        <div className="flex flex-col justify-center w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}>
            {book.bookName}
          </h2>
          <h4 className="text-xl md:text-2xl italic mb-4 text-gray-600">by {book.author}          </h4>
          <p className="text-base md:text-lg mb-5 text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
            Book Description: <span><br/></span>{book.description}
          </p>
          <p className="text-base md:text-lg text-gray-600 mb-5">Usual time to read: 5 hours</p>
          <button 
            className={`mt-4 md:mt-5 py-2 px-4 bg-blue-500 text-white rounded-lg font-bold text-lg flex items-center justify-center transition-transform duration-300 ${isReadHover ? 'bg-blue-700 transform scale-105' : ''} w-full md:w-auto`}
            onClick={addToLibrary}
            onMouseEnter={() => setIsReadHover(true)}
            onMouseLeave={() => setIsReadHover(false)}
          >
            <FaBookOpen size={20} className="mr-2" />
            Read
          </button>

        </div>
      </div>
    </div>
  );
};

export default ExpandedView;

