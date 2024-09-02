import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function AddBook() {
  const [bookData, setBookData] = useState({
    bookName: '',
    author: '',
    description: '',
    dateAdded: '',
    category: '', // Added category field
  });
  const [coverImages, setCoverImages] = useState([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null); // For EPUB file name
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle change in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle image input changes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setCoverImages((prevImages) => [...prevImages, ...files]);
    setCoverImagePreviews((prevPreviews) => [...prevPreviews, ...imagePreviews]);
    setShowImageInput(false);
  };

  // Handle EPUB file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/epub+zip') {
      setFile(file);
      setFileName(file.name);
    } else {
      toast.error('Please upload a valid EPUB file');
      setFile(null);
      setFileName(null);
    }
  };

  // Convert file to Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // This is the line that converts the file to Base64
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Function to check if file size is within limit (e.g., 1GB)
    const isFileSizeValid = (file) => file.size <= 1 * 1024 * 1024 * 1024; // 1GB in bytes

    // Check if all files are valid
    if (coverImages.some(image => !isFileSizeValid(image)) || (file && !isFileSizeValid(file))) {
      toast.error('One or more files exceed the 1GB size limit.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert cover images to Base64
      const imagePromises = coverImages.map((image) => convertFileToBase64(image));
      const base64Images = await Promise.all(imagePromises);

      // Prepare form data
      const formData = new FormData();
      formData.append('bookName', bookData.bookName);
      formData.append('author', bookData.author);
      formData.append('description', bookData.description);
      formData.append('category', bookData.category); // Add category
      formData.append('dateAdded', convertToIST(bookData.dateAdded)); // Convert date to IST

      // Append Base64 cover images
      base64Images.forEach((base64Image) => {
        formData.append('coverImages', base64Image);
      });

      // Append EPUB file directly
      if (file) {
        formData.append('bookFile', file);
      }

      // Send the form data to the server
      await axios.post('http://localhost:5454/api/books/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Use multipart/form-data for file uploads
        },
        timeout: 60000 * 2, // 2 minutes timeout
      });
      alert('book added successfully!')
      toast.success('Book added successfully!');
    } catch (error) {
      toast.error(`Error adding the book: ${error.response?.data?.error || 'Unknown error'}`);
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
      // Reset form fields
      setBookData({
        bookName: '',
        author: '',
        description: '',
        dateAdded: '',
        category: '',
      });
      setCoverImages([]);
      setCoverImagePreviews([]);
      setFile(null);
      setFileName(null);
    }
  };
    // Handle removing an image
    const handleRemoveImage = (index) => {
      setCoverImages((prevImages) => prevImages.filter((_, i) => i !== index));
      setCoverImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };
  
    // Handle replacing an image
    const handleReplaceImage = (e, index) => {
      const file = e.target.files[0];
      if (file) {
        const newImagePreview = URL.createObjectURL(file);
        setCoverImages((prevImages) => prevImages.map((img, i) => (i === index ? file : img)));
        setCoverImagePreviews((prevPreviews) => prevPreviews.map((preview, i) => (i === index ? newImagePreview : preview)));
      }
    };
  

  // Convert local time to IST
  const convertToIST = (localDate) => {
    const date = new Date(localDate);
    const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    return new Date(date.getTime() + offset).toISOString();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-black max-w-xl mx-auto p-4 bg-gray-100 mt-10 shadow-md rounded-lg mb-6 bg-white h-[800px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-300"
    >
      <h2 className="text-3xl font-bold mb-4 text-center text-black">Add Book</h2>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Book Name</label>
        <input
          type="text"
          name="bookName"
          value={bookData.bookName}
          onChange={handleChange}
          placeholder="Enter the book name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Author</label>
        <input
          type="text"
          name="author"
          value={bookData.author}
          onChange={handleChange}
          placeholder="Enter the author name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Description</label>
        <textarea
          name="description"
          value={bookData.description}
          onChange={handleChange}
          placeholder="Enter the description"
          rows="4"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      
      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Category</label>
        <select
          name="category"
          value={bookData.category}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">Select a category</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Biography">Biography</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Mystery">Mystery</option>
          <option value="Romance">Romance</option>
          <option value="Horror">Horror</option>
          <option value="Other">Other</option>
        </select>
      </div>


      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Add Date</label>
        <input
          type="datetime-local"
          name="dateAdded"
          value={bookData.dateAdded}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Cover Images</label>

        {/* File input for adding images */}
        {showImageInput && (
          <div className="mb-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}

        {/* Button to add more images */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setShowImageInput(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add More Images
          </button>
        </div>

        {/* Preview section */}
        <div className="flex flex-wrap mt-2">
          {coverImagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-32 h-32 object-cover mr-2 mb-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                X
              </button>
              <input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => handleReplaceImage(e, index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">EPUB File</label>
        <input
          type="file"
          accept=".epub"
          onChange={handleFileChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {fileName && (
          <div className="mt-2">
            <p className="text-black text-lg">Selected EPUB: {fileName}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}

export default AddBook;
