import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useEdgesState } from "../hook/useNodesEdgesState";

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    console.log("isAuthenticated in Navigation", isAuthenticated);
    
  }, []);

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-13">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                DrawApp
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/home"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              DrawApp
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm">
              Welcome, {user || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 