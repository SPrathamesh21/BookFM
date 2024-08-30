import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 w-full p-4 text-center shadow-inner">
      <p>&copy; 2024 BookFM. All rights reserved.</p>
      <div className="mt-2">
        <a href="/privacy" className="mx-3 hover:text-teal-400">
          Privacy Policy
        </a>
        <a href="/terms" className="mx-3 hover:text-teal-400">
          Terms of Service
        </a>
      </div>
    </footer>
  );
}

export default Footer;
