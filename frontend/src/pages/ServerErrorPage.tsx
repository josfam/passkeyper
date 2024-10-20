import React from 'react';
import { Link } from 'react-router-dom';

const ServerErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">500</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! Something went wrong on our end.</p>
      <Link to="/passwords" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">
        Go Home
      </Link>
    </div>
  );
};

export default ServerErrorPage;