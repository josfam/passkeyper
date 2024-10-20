import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! Page not found.</p>
      <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;