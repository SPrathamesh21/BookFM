import React, { useState, useEffect } from "react";
import axios from "../../../../axiosConfig";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from "react-icons/fa";

function EditEbook() {
  const { id } = useParams();
  const [ebookData, setEbookData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
  });
  const [coverImages, setCoverImages] = useState([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState([]);
  const [ebookFile, setEbookFile] = useState(null);
  const [imageToReplace, setImageToReplace] = useState(null);
  const [dropdown, setDropdown] = useState({
    category: false,
  });
  const navigate = useNavigate();
  const categories = ["Fiction", "Non-Fiction", "Science", "History", "Biography", "Fantasy"];

  useEffect(() => {
    const fetchEbookData = async () => {
      try {
        const response = await axios.get(`/api/books/get_ebook/${id}`);
        const ebook = response.data;

        // Set ebook data
        setEbookData({
          title: ebook.bookName || "",
          author: ebook.author || "",
          description: ebook.description || "",
          category: ebook.category || ""
        });

        // Set existing cover images
        if (ebook.coverImages && ebook.coverImages.length > 0) {
          setCoverImages(ebook.coverImages);
          setCoverImagePreviews(ebook.coverImages.map((image, index) => ({
            url: `${image}`,
            id: index
          })));
        }

        // Set existing EPUB file (if needed)
        if (ebook.EPUBbase64 && ebook.EPUBbase64.filename) {
          setEbookFile({ name: ebook.EPUBbase64.filename, id: ebook.EPUBbase64.id });
        }
      } catch (error) {
        toast.error(`Error fetching ebook data. Please try again. ${error}`);
      }
    };

    fetchEbookData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEbookData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;

    if (name === "coverImages") {
      const selectedImages = Array.from(files);

      if (imageToReplace !== null) {
        // Replace specific image
        const base64Images = await Promise.all(selectedImages.map(fileToBase64));
        setCoverImages(prevImages => {
          const updatedImages = [...prevImages];
          updatedImages[imageToReplace] = base64Images[0];
          return updatedImages;
        });

        setCoverImagePreviews(prevPreviews => {
          const updatedPreviews = [...prevPreviews];
          updatedPreviews[imageToReplace] = { url: base64Images[0], id: imageToReplace };
          return updatedPreviews;
        });

        setImageToReplace(null);
      } else {
        // Add new images
        const base64Images = await Promise.all(selectedImages.map(fileToBase64));
        setCoverImages(prevImages => [...prevImages, ...base64Images]);
        setCoverImagePreviews(prevPreviews => [...prevPreviews, ...base64Images.map((base64, index) => ({
          url: base64,
          id: Date.now() + index
        }))]);
      }
    } else if (name === "ebookFile") {
      const file = files[0];
      if (file && file.type === "application/epub+zip") {
        setEbookFile({ name: file.name, file });
      } else {
        toast.error("Please upload a valid EPUB file.");
      }
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ensure the Base64 string is in the correct format
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDropdownSelect = (dropdownName, value) => {
    setEbookData((prevData) => ({ ...prevData, [dropdownName]: value }));
    setDropdown((prevState) => ({
      ...prevState,
      [dropdownName]: false,
    }));
  };

  const toggleDropdown = (dropdownName) => {
    setDropdown((prevState) => ({
      ...prevState,
      [dropdownName]: !prevState[dropdownName],
    }));
  };

  const handleReplaceImage = (index) => {
    setImageToReplace(index);
    document.querySelector(`input[name="coverImages"]`).click();
  };

  const handleDeleteImage = (imageId) => {
    setCoverImagePreviews(prevPreviews => prevPreviews.filter(img => img.id !== imageId));
    setCoverImages(prevImages => prevImages.filter((_, index) => index !== coverImagePreviews.findIndex(img => img.id === imageId)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("bookName", ebookData.title);
    formData.append("author", ebookData.author);
    formData.append("description", ebookData.description);
    formData.append("category", ebookData.category);

    coverImages.forEach((image) => {
      // Ensure the Base64 images are added correctly
      formData.append("coverImages", image);
    });

    if (ebookFile) {
      formData.append("ebookFile", ebookFile.file);
    }

    try {
      await axios.put(`/api/books/update_ebook/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Ebook updated successfully!");
      navigate('/admin_panel/editEbookPage');
    } catch (error) {
      toast.error(`Error updating ebook. Please try again. ${error}`);
    }
  };

  const handleCancel = () => {
    navigate('/admin_panel/editEbookPage');
  };

  return (
    <form
      className="edit-ebook-form border-2 border-black max-w-xl mx-auto p-4 bg-gray-100 mt-10 shadow-md rounded-lg mb-6 bg-white h-[800px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-300"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      <h2 className="text-3xl font-bold mb-4 text-center text-black">Edit Ebook</h2>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Title</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="title"
          placeholder="Enter The Ebook Title"
          value={ebookData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Author</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="author"
          placeholder="Enter The Author Name"
          value={ebookData.author}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Description</label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="description"
          placeholder="Enter The Description"
          value={ebookData.description}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <Dropdown
        label="Category"
        name="category"
        options={categories}
        value={ebookData.category}
        onSelect={(value) => handleDropdownSelect('category', value)}
        isOpen={dropdown.category}
        toggleDropdown={() => toggleDropdown("category")}
      />

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Cover Images</label>
        <input
          className="hidden"
          type="file"
          name="coverImages"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        {coverImagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {coverImagePreviews.map((image, index) => (
              <div key={image.id} className="relative">
                <img
                  src={image.url}
                  alt={`Cover ${index}`}
                  className="w-32 h-32 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <FaTrashAlt />
                </button>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full"
                  onClick={() => handleReplaceImage(index)}
                >
                  <FaEdit />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          onClick={() => document.querySelector('input[name="coverImages"]').click()}
        >
          {imageToReplace !== null ? "Replace Image" : "Add Images"}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">EPUB File</label>
        <input
          className="block w-full text-gray-700 mb-2"
          type="file"
          name="ebookFile"
          accept=".epub"
          onChange={handleFileChange}
        />
        {ebookFile && (
          <p className="text-gray-600">Selected EPUB file: {ebookFile.name}</p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Ebook
        </button>
      </div>
    </form>
  );
}

const Dropdown = ({ label, name, options, value, onSelect, isOpen, toggleDropdown }) => (
  <div className="mb-4">
    <label className="block text-black text-xl font-bold mb-2">{label}</label>
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex justify-between items-center"
      >
        {value || `Select ${label}`}
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow-lg mt-2">
          {options.map((option) => (
            <li
              key={option}
              className="cursor-pointer py-2 px-4 hover:bg-gray-200"
              onClick={() => onSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default EditEbook;
