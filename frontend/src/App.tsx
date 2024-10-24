import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/Sidebar";
import Passwords from "./pages/Passwords";
import Trash from "./pages/Trash";
import ImportExport from "./pages/ImportExport";
import PasswordGenerator from "./pages/PasswordGenerator";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SecurityDashboard from './pages/Dashboard';
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import "./styles/App.css";
import "./styles/base.css";
import HamburgerBtn from "./components/buttons/HamburgerBtn";
import { Toaster } from "@/components/ui/toaster"


const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/check-auth`, {
        withCredentials: true,
      });
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.status);
      } else {
        setError(500);
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.status);
      } else {
        setError(500);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error === 404) {
    return <NotFoundPage />;
  }

  if (error === 500) {
    return <ServerErrorPage />;
  }

  const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
    element,
  }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  const AppContent: React.FC = () => {
    const location = useLocation();
    const hideOnPaths = ['/', '/login', '/signup'];
    const shouldHideSidebar = hideOnPaths.includes(location.pathname);

    return (
		<>
	    <ToastContainer></ToastContainer> {/* toast messages */}
		<div className="flex flex-col h-screen overflow-hidden md:flex-row">
        {isAuthenticated && !shouldHideSidebar && (
          <>
            <div className="z-30 h-16 p-4 flex w-full bg-slate-200 relative md:hidden">
              <HamburgerBtn
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
              />
            </div>
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <Sidebar isOpen={isSidebarOpen} onLogout={handleLogout} />
          </>
        )}
        <div
          id="content-area"
          className={`bg-white min-h-screen flex-1 flex-col overflow-y-scroll`}
        >
          <Routes>
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/passwords"
              element={<ProtectedRoute element={<Passwords />} />}
            />
            <Route
              path="/trash"
              element={<ProtectedRoute element={<Trash />} />}
            />
            <Route
              path="/import-export"
              element={<ProtectedRoute element={<ImportExport />} />}
            />
            <Route
              path="/generator"
              element={<ProtectedRoute element={<PasswordGenerator />} />}
            />
            <Route
              path="/settings"
              element={<ProtectedRoute element={<Settings />} />}
            />
            <Route path="/" element={<LandingPage />} />
            <Route path='/dashboard' element={<ProtectedRoute element={<SecurityDashboard />} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </div>
      </div>
	  </>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;