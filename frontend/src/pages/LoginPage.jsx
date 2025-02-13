import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [mode, setMode] = useState("login"); // Tracks the current mode: 'login', 'register', 'forgotPassword'
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // General message (success or error)
  const [errorMessage, setErrorMessage] = useState(""); // Specific error message
  const [fieldErrors, setFieldErrors] = useState({}); // Store error for individual fields
  const navigate = useNavigate(); 

  // Handle the form submission based on the mode (login, register, forgotPassword)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare data based on the mode
    const data = { email, password, username };
    if (mode === "register") {
      data.username = username;
      data.email = email;
      data.password = password;
    } else if (mode === 'login') {
      data.username = username;
      data.password = password;
    } else if (mode === 'forgotPassword') {
      data.email = email;
    }
  
    try {
      let response;
      if (mode === "login") {
        response = await axios.post("http://localhost:8080/api/auth/login", data);
        if (response.data.token) {
          // Store token in localStorage
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("role", response.data.userRole);
          localStorage.setItem("userId", response.data.userId);
  
          // Redirect based on role
          if (response.data.userRole === "admin") {
            navigate("/admin-dashboard");
          } else if (response.data.userRole === "user") {
            navigate("/dashboard");
          }
        }
      } else if (mode === "register") {
        response = await axios.post("http://localhost:8080/api/auth/register", data);
        if (response.data.message) {
          setMessage(response.data.message); // Show success message
          setMode("login"); // Switch back to login mode after registration
          setUsername(""); // Clear form fields
          setEmail("");
          setPassword("");
        }
      } else if (mode === "forgotPassword") {
        response = await axios.post("http://localhost:8080/api/auth/forgot-password/request", { email });
        setMessage("Check your email for reset instructions.");
        return;
      }
  
      setErrorMessage(""); // Clear any previous error messages
      setFieldErrors({}); // Clear field-specific errors
    } catch (error) {
      setMessage(""); // Clear any previous success messages
      if (error.response?.data?.message) {
        setErrorMessage(error.response?.data?.message);
      }
      if (error.response?.data?.errors) {
        setFieldErrors(error.response?.data?.errors);
      }
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          {mode === "login"
            ? "Login"
            : mode === "register"
            ? "Register"
            : "Forgot Password"}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Username field for Register and login mode */}
          {(mode === "login" || mode === "register") && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-600">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`w-full px-4 py-2 mt-2 border ${
                  fieldErrors.username ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {fieldErrors.username && (
                <p className="text-red-500 text-xs">{fieldErrors.username}</p>
              )}
            </div>
          )}

          {/* Email field (for Register and Forgot Password) */}
          {(mode === "register" || mode === "forgotPassword") && (
            <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 mt-2 border ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs">{fieldErrors.email}</p>
            )}
          </div>
          )}
          

          {/* Password field */}
          {(mode === "login" || mode === "register") && (
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 mt-2 border ${
                  fieldErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs">{fieldErrors.password}</p>
              )}
            </div>
          )}

          {/* Message */}
          {message && <div className="text-center text-green-500 mb-4">{message}</div>}
          {errorMessage && <div className="text-center text-red-500 mb-4">{errorMessage}</div>}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 mt-4 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {mode === "login"
              ? "Login"
              : mode === "register"
              ? "Register"
              : "Request Password Reset"}
          </button>
        </form>

        {/* Toggle between modes */}
        <div className="mt-4 text-center">
          {mode === "login" ? (
            <>
              <p>
                Don't have an account?{" "}
                <span
                  className="text-indigo-600 cursor-pointer"
                  onClick={() => setMode("register")}
                >
                  Register
                </span>
              </p>
              <p className="mt-2">
                Forgot your password?{" "}
                <span
                  className="text-indigo-600 cursor-pointer"
                  onClick={() => setMode("forgotPassword")}
                >
                  Reset it
                </span>
              </p>
            </>
          ) : mode === "register" ? (
            <p>
              Already have an account?{" "}
              <span
                className="text-indigo-600 cursor-pointer"
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </p>
          ) : (
            <p>
              Back to{" "}
              <span
                className="text-indigo-600 cursor-pointer"
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
