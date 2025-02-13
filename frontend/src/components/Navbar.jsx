import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in and retrieve role
  const isLoggedIn = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role"); // Assuming 'role' is stored in localStorage

  // Logout function
  const handleLogout = () => {
    // Clear the localStorage to remove the auth token
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/", { replace: true });

    // Prevent back navigation to the previous page
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
    window.history.pushState(null, "", window.location.href);
  };};

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Branding */}
        <div className="text-2xl font-semibold">
          <Link to={isLoggedIn ? (userRole === "admin" ? "/admin-dashboard" : "/dashboard") : "/"}>AudioApp</Link>
        </div>


        {/* Hamburger Icon */}
        <div className="lg:hidden flex flex-col justify-between w-6 h-6" onClick={() => setIsOpen(!isOpen)}>
          <div className="bg-white h-1 w-full mb-1"></div>
          <div className="bg-white h-1 w-full mb-1"></div>
          <div className="bg-white h-1 w-full"></div>
        </div>

        {/* Navigation Links */}
        <div className={`lg:flex ${isOpen ? 'block' : 'hidden'} space-x-4`}>
          {/* Conditional rendering based on login status */}
          {isLoggedIn ? (
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to={userRole === "admin" ? "/admin-dashboard" : "/dashboard"} className="hover:text-indigo-200">
                  {userRole === "admin" ? "Admin Dashboard" : "Dashboard"}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-200">
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:text-indigo-200 bg-transparent text-white px-4 py-2 rounded-md focus:outline-none"
                >
                  Logout
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
