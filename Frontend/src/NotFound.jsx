// src/NotFound.js
import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-700 flex flex-col justify-center items-center text-center text-white">
      <div className="space-y-4">
        <h1 className="text-9xl font-bold">404</h1>
        <h2 className="text-2xl md:text-4xl">Look like you're lost in space</h2>
        <button
          onClick={() => window.history.back()}
          className="mt-8 px-4 py-2 bg-white text-purple-700 rounded-lg shadow-lg hover:bg-purple-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
