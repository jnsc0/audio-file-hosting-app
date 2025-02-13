import { useEffect, useState } from "react";
import axios from "axios";
//USERS VIEW USER, EDIT, DELETE
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setUpdatedUser({
        username: response.data.username,
        email: response.data.email,
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError("Failed to load profile.");
    }
  };

  const handleChange = (e) => {
    setUpdatedUser({
      ...updatedUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match before submitting
    if (updatedUser.password !== updatedUser.confirmPassword) {
      setError("Passwords do not match.");
      return; // Prevent update if passwords don't match
    }

    if (!updatedUser.confirmPassword) {
      setError("Please confirm your password.");
      return; // Prevent update if confirm password is empty
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/user/${userId}`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      setIsEditing(false);
      setError(""); // Clear error after successful update
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedUser({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      window.location.href = "/"; // Redirect to login after deletion
    } catch (err) {
      setError("Failed to delete account.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isEditing ? "Edit Profile" : "User Profile"}
        </h2>

        {/* Profile or Edit Mode */}
        {!isEditing ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600 font-semibold">Username:</p>
              <p className="text-gray-900">{user.username}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 font-semibold">Email:</p>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 font-semibold">Password:</p>
              <p className="text-gray-900">********</p>
            </div>

            <button
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
              onClick={() => setIsEditing(true)} // Enable edit mode
            >
              Edit Profile
            </button>

            <button
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 mt-4"
              onClick={() => setShowDeleteModal(true)} // Show delete confirmation modal
            >
              Delete Account
            </button>
          </>
        ) : (
          // Edit Mode Form
          <form onSubmit={handleSubmit}>
            {/* Display error message if passwords do not match */}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={updatedUser.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={updatedUser.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={updatedUser.password}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-600"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={updatedUser.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
