import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Menu, X } from "lucide-react"; // lightweight icons

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          StoryChain
        </Link>

        {/* Hamburger button (mobile) */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
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
          {currentUser ? (
            <>
              <span className="text-sm">👤 {currentUser.username}</span>
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700 text-white flex flex-col items-center gap-4 py-4">
          <Link to="/" className="hover:text-gray-200" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          {currentUser && (
            <Link to="/write" className="hover:text-gray-200" onClick={() => setIsOpen(false)}>
              Write
            </Link>
          )}
          {currentUser && (
            <Link
              to={`/profile/${currentUser.username}`}
              className="hover:text-gray-200"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          )}
          {currentUser ? (
            <>
              <span className="text-sm">👤 {currentUser.username}</span>
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
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
