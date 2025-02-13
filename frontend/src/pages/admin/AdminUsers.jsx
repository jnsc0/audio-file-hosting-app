import { useEffect, useState } from "react";
import axios from "axios";
// ADMIN VIEW USERS, EDIT, DELETE

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "", // New state for confirm password
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8080/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users.");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8080/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUpdatedUser({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setError(""); // Clear any existing error when editing
  };

  const handleUpdate = async () => {
    // Check if password and confirm password match before submitting
    if (updatedUser.password !== updatedUser.confirmPassword) {
      setError("Passwords do not match.");
      return; // Prevent update if passwords don't match
    }

    if (!updatedUser.confirmPassword) {
      setError("Please confirm your password.");
      return; // Prevent update if confirm password is empty
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:8080/api/user/${editingUser._id}`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      setEditingUser(null);
      setError(""); // Clear the error state after successful update
    } catch (err) {
      setError("Failed to update user.");
    }
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setError(""); // Clear error when closing modal
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">User Management</h2>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">#</th>
              <th className="border p-3 text-left">Username</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Role</th>
              <th className="border p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user._id} className="text-left bg-white hover:bg-gray-100">
                <td className="border p-3">{(currentPage - 1) * usersPerPage + index + 1}</td>
                <td className="border p-3">{user.username}</td>
                <td className="border p-3">{user.email}</td>
                <td className="border p-3">{user.role}</td>
                <td className="border p-3 flex flex-wrap gap-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>

            {/* Display error message inside the modal if there is an error */}
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={updatedUser.username}
              onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={updatedUser.email}
              onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <label className="block text-sm font-medium">Password (Leave blank to keep current)</label>
            <input
              type="password"
              value={updatedUser.password}
              onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={updatedUser.confirmPassword}
              onChange={(e) => setUpdatedUser({ ...updatedUser, confirmPassword: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <label className="block text-sm font-medium">Role</label>
            <select
              value={updatedUser.role}
              onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                onClick={handleCloseModal} // Use this function
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
