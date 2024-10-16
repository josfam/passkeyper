import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Passwords from './pages/Passwords';
import Trash from './pages/Trash';
import ImportExport from './pages/ImportExport';
import PasswordGenerator from './pages/PasswordGenerator';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/App.css';
import './styles/base.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // For toggling the sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/check-auth`, { withCredentials: true });
        setIsAuthenticated(response.data.authenticated);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div id='app-container' className='flex w-full flex-col md:flex-row'>
        {isAuthenticated && (
			<>
				{/* Hamburger button for small screens */}
				<button
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-4 md:hidden flex min-w-full bg-slate-200'
					>
					<FontAwesomeIcon icon={ faBars } className='w-6'/>
					{/* Hamburger Icon */}
				</button>
				{/* Sidebar */}
				<Sidebar isOpen={isSidebarOpen} />
			</>
		)}
        <div id='content-area' className='bg-white min-h-screen flex flex-col'>
          <Routes>
            <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/passwords' element={<ProtectedRoute element={<Passwords />} />} />
            <Route path="/trash" element={<ProtectedRoute element={<Trash />} />} />
            <Route path='/import-export' element={<ProtectedRoute element={<ImportExport />} />} />
            <Route path='/generator' element={<ProtectedRoute element={<PasswordGenerator />} />} />
            <Route path='/settings' element={<ProtectedRoute element={<Settings />} />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/passwords" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;