import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";
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
import "./styles/App.css";
import "./styles/base.css";
import HamburgerBtn from "./components/buttons/HamburgerBtn";

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/check-auth`, {
        withCredentials: true,
      });
      setIsAuthenticated(response.data.authenticated);
    } catch {
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
    element,
  }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  const shouldNotHaveTopOffset = (): boolean => {
    return location.pathname === "/login" || location.pathname === "/signup";
  };

  return (
    <Router>
      <div
        id="app-container"
        className="flex flex-col h-screen overflow-hidden md:flex-row"
      >
        {isAuthenticated && (
          <div>
            <div
              className="z-30 h-16 p-4 flex w-full bg-slate-200 fixed
                md:hidden"
            >
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
          </div>
        )}
        <div
          id="content-area"
          className={`bg-white min-h-screen flex-1 flex-col overflow-y-scroll
            ${shouldNotHaveTopOffset() ? "mt-0" : "mt-16 md:mt-0"}`}
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
            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated ? "/passwords" : "/login"}
                  replace
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;