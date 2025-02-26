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
    <div className="flex flex-col md:flex-row justify-center items-center h-screen p-4 space-y-4 md:space-y-0 md:space-x-4">
      <div
        className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg w-full md:w-60 h-60 cursor-pointer hover:bg-indigo-700 transition"
        onClick={() => navigate("/admin/users")}
      >
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-sm mt-2">Click to view and manage users</p>
      </div>

      <div
        className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg w-full md:w-60 h-60 cursor-pointer hover:bg-indigo-700 transition"
        onClick={() => navigate("/admin/audio")}
      >
        <h2 className="text-2xl font-bold">Audio File Management</h2>
        <p className="mt-2">Click to view and manage audio files</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
