import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        navigate("/login");
      } else {
        console.error("Logout failed");
        // Still redirect to login page even if logout fails
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Redirect to login page even if there's an error
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Logout
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Are you sure you want to logout?
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging out..." : "Yes, Logout"}
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="flex-1 group relative flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout; 