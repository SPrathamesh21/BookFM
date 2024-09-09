import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt, FaChevronDown } from "react-icons/fa";

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
  </div>
);

function AddBook() {
  const [bookData, setBookData] = useState({
    bookName: '',
    author: '',
    description: '',
    category: '', // Added category field
    recommendedByCabin: 'No', // New field with default value
  });
  const [coverImages, setCoverImages] = useState([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null); // For EPUB file name
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown state


  // Handle change in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle category dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  // Handle image input changes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setCoverImages((prevImages) => [...prevImages, ...files]);
    setCoverImagePreviews((prevPreviews) => [...prevPreviews, ...imagePreviews]);
    setShowImageInput(false);
  };

   // Handle EPUB/PDF file input changes
   const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/epub+zip' || file.type === 'application/pdf')) {
      setFile(file);
      setFileName(file.name);
    } else {
      toast.error('Please upload a valid EPUB or PDF file');
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
      formData.append('recommendedByCabin', bookData.recommendedByCabin); // Add the new field


      // Append Base64 cover images
      base64Images.forEach((base64Image) => {
        formData.append('coverImages', base64Image);
      });

      // Append EPUB/pdf file directly
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
        recommendedByCabin: 'No',
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


      {/* Category dropdown */}
      <div className="mb-4 relative">
        <label className="block text-black text-xl font-bold mb-2">Category</label>
        <div className="relative">
          <select
            name="category"
            value={bookData.category}
            onChange={handleChange}
            onClick={toggleDropdown} // Toggle dropdown on click
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-8"
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
          <FaChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
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
          <div className="grid grid-cols-3 gap-2">
            {coverImagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-42 h-42 object-cover mr-2 mb-2 border border-gray-300 rounded-md"
                />

                {/* Remove image button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1"
                >
                  <FaTrashAlt />
                </button>

                {/* Replace image input with edit icon */}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-700 text-white rounded-full p-1"
                  onClick={() => document.getElementById(`replaceImageInput${index}`).click()}
                >
                  <FaEdit />
                </button>
                <input
                  id={`replaceImageInput${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleReplaceImage(e, index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Upload EPUB/PDF</label>
        <input
          type="file"
          accept=".epub,.pdf"
          onChange={handleFileChange}
          className="w-full py-2 px-3 border rounded"
        />
        {fileName && (
          <div className="mt-2">
            <p className="text-black text-lg">Selected EPUB: {fileName}</p>
          </div>
        )}
      </div>

      {/* New field for "Recommended by Cabin" */}
      <div className="mb-4 relative">
        <label className="block text-black text-xl font-bold mb-2">Recommended by Cabin</label>
        <div className='relative'>
        <select
          name="recommendedByCabin"
          value={bookData.recommendedByCabin}
          onChange={handleChange}
            required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <FaChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
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
      {isSubmitting && <Loader />}

    </form>
  );
}

export default AddBook;
