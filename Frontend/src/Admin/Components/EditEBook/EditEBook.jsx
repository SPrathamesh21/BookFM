import React, { useState, useEffect } from "react";
import axios from "../../../../axiosConfig";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate  } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from "react-icons/fa";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
}
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader state

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
      if (file) {
        if (file.type === "application/epub+zip") {
          // Handle EPUB file
          setEbookFile({ name: file.name, file });
        } else if (file.type === "application/pdf") {
          // Handle PDF file
          setEbookFile({ name: file.name, file });
        } else {
          toast.error("Please upload a valid EPUB or PDF file.");
        }
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
    setIsSubmitting(true); // Show loader

    const formData = new FormData();
    formData.append("title", ebookData.title);
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
    } finally {
      setIsSubmitting(false); // Hide loader
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
                <div className="absolute top-0 right-0 flex space-x-2 p-1">
                  <button
                    type="button"
                    onClick={() => handleReplaceImage(index)}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-1 py-1 rounded-full"
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="bg-red-500 hover:bg-red-700 text-white px-1 py-1 rounded-full"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => document.querySelector('input[name="coverImages"]').click()}
          className="mt-2 bg-blue-500 hover:bg-blue-700 mt-5 text-white px-4 py-2 rounded"
        >
          Add More Images
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">EPUB File</label>
        <input
          type="file"
          name="ebookFile"
          accept=".epub,.pdf"
          onChange={handleFileChange}
        />
        {ebookFile && <p>Selected EPUB: {ebookFile.name}</p>}
      </div>

      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Ebook
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
      {isSubmitting && <Loader />}

    </form>
  );
}

function Dropdown({ label, name, options, value, onSelect, isOpen, toggleDropdown }) {
  return (
    <div className="relative mb-4">
      <label className="block text-black text-xl font-bold mb-2">{label}</label>
      <button
        type="button"
        className="block w-full bg-gray-200 text-gray-700 py-2 px-3 rounded"
        onClick={toggleDropdown}
      >
        {value || "Select a category"}
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => onSelect(option)}
              className="cursor-pointer hover:bg-gray-100 px-4 py-2"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EditEbook;
