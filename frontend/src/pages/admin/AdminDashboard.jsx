import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const token = localStorage.getItem("authToken");

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="bg-blue-600 text-white p-6 rounded-lg shadow-lg w-80 cursor-pointer hover:bg-blue-700 transition"
        onClick={() => navigate("/admin/users")}
      >
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="mt-2">Total Users: {users.length}</p>
        <p className="text-sm mt-2">Click to view and manage users</p>
      </div>

      <div
        className="bg-green-600 text-white p-6 rounded-lg shadow-lg w-80 cursor-pointer hover:bg-green-700 transition"
        onClick={() => navigate("/admin/audio")}
      >
        <h2 className="text-2xl font-bold">Audio File Management</h2>
        <p className="mt-2">Click to view and manage audio files</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
