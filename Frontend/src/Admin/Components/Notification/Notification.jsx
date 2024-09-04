import React, { useState, useRef } from 'react';
import axios from '../../../../axiosConfig';
import { toast } from 'react-toastify';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
  </div>
);

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const Notification = () => {
  const [notification, setNotification] = useState({ title: '', description: '' });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotification((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const base64Files = await Promise.all(selectedFiles.map(convertFileToBase64));

    setFiles((prevFiles) => [...prevFiles, ...base64Files]);

    const previews = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFilePreviews((prevPreviews) => [...prevPreviews, ...previews]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleReplaceFile = async (e, index) => {
    const replacedFile = e.target.files[0];
    if (replacedFile) {
      const base64File = await convertFileToBase64(replacedFile);
      const updatedFiles = [...files];
      updatedFiles[index] = base64File;
      setFiles(updatedFiles);

      const updatedPreviews = [...filePreviews];
      updatedPreviews[index] = {
        file: replacedFile,
        preview: URL.createObjectURL(replacedFile),
      };
      setFilePreviews(updatedPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      title: notification.title,
      description: notification.description,
      files,
    };

    try {
      const response = await axios.post('/api/books/notification', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        toast.success('Files uploaded successfully');
        setNotification({ title: '', description: '' });
        setFiles([]);
        setFilePreviews([]);
      } else {
        toast.error('Error occurred');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-black max-w-xl mx-auto p-4 bg-gray-100 mt-10 shadow-md rounded-lg mb-6 bg-white h-[650px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-300"
    >
      <h2 className="text-3xl font-bold mb-4 text-center text-black">Notification</h2>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={notification.title}
          onChange={handleChange}
          placeholder="Enter the title"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Description</label>
        <textarea
          name="description"
          id="description"
          value={notification.description}
          onChange={handleChange}
          placeholder="Enter the description"
          rows="4"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-xl font-bold mb-2">Files</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.epub"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="mb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add More Files
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {filePreviews.map((filePreview, index) => (
            <div key={index} className="relative">
              {filePreview.file.type.startsWith('image/') ? (
                <img
                  src={filePreview.preview}
                  alt={`Preview ${index}`}
                  className="w-42 h-42 object-cover border border-gray-300 rounded-md"
                />
              ) : filePreview.file.type === 'application/pdf' ? (
                <iframe
                  src={filePreview.preview}
                  title={`PDF Preview ${index}`}
                  className="w-32 h-32 border border-gray-300 rounded-md"
                  frameBorder="0"
                />
              ) : (
                <div className="w-42 h-42 border border-gray-300 rounded-md flex items-center justify-center">
                  <span>{filePreview.file.type === 'application/epub+zip' ? 'EPUB files cannot be previewed' : 'File Preview'}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1"
              >
                <FaTrashAlt />
              </button>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-700 text-white rounded-full p-1"
                onClick={() => document.getElementById(`replaceFileInput${index}`).click()}
              >
                <FaEdit />
              </button>
              <input
                id={`replaceFileInput${index}`}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.epub"
                className="hidden"
                onChange={(e) => handleReplaceFile(e, index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      {isSubmitting && <Loader />}
    </form>
  );
};

export default Notification;
