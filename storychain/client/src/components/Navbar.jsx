import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Home */}
        <Link to="/" className="text-2xl font-bold">
          StoryChain
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-gray-200">
            Home
          </Link>
          {currentUser && (
            <Link to="/write" className="hover:text-gray-200">
              Write
            </Link>
          )}
          {currentUser && (
            <Link
              to={`/profile/${currentUser.username}`}
              className="hover:text-gray-200"
            >
              Profile
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-sm">
                👤 {currentUser.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
