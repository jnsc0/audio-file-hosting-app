import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [editedAudio, setEditedAudio] = useState({
    title: '',
    category: '',
    description: '',
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState(null);
  const [filter, setFilter] = useState({
    title: '',
    user: '',
    status: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAudioFiles();
    fetchUsers();
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8080/api/audio", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAudioFiles(response.data);
      setFilteredFiles(response.data);
    } catch (error) {
      console.error('Error fetching audio files', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8080/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleEditClick = (file) => {
    setSelectedAudio(file);
    setEditedAudio({
      title: file.title,
      category: file.category,
      description: file.description,
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditedAudio({ ...editedAudio, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAudio) return;

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("audioFile", e.target.audioFile?.files[0] || selectedAudio.fileUrl);
      formData.append("title", e.target.title.value);
      formData.append("category", e.target.category.value);
      formData.append("description", e.target.description.value);

      await axios.put(`http://localhost:8080/api/audio/${selectedAudio._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      fetchAudioFiles(); // Refresh data
    } catch (error) {
      console.error('Error updating audio file', error);
    }
  };

  const handleDelete = (file) => {
    setAudioToDelete(file);
    setIsConfirmingDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8080/api/audio/${audioToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsConfirmingDelete(false);
      setAudioToDelete(null);
      fetchAudioFiles(); // Refresh data
    } catch (error) {
      console.error('Error deleting audio file', error);
    }
  };

  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setAudioToDelete(null);
  };

  const handleRestore = async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`http://localhost:8080/api/audio/${file._id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAudioFiles(); // Refresh data after restoring
    } catch (error) {
      console.error('Error restoring audio file', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => {
      const newFilter = { ...prevFilter, [name]: value };
      const filtered = audioFiles.filter((file) => {
        return (
          (newFilter.title ? file.title.includes(newFilter.title) : true) &&
          (newFilter.user ? users.find((user) => user._id === file.user)?.username.toLowerCase().includes(newFilter.user.toLowerCase()) : true) &&
          (newFilter.status ? (newFilter.status === 'Active' ? !file.deletedAt : file.deletedAt) : true)
        );
      });
      setFilteredFiles(filtered);
      return newFilter;
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Audio Files</h1>

      {/* Filter Section */}
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          name="title"
          placeholder="Filter by title"
          value={filter.title}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="user"
          placeholder="Filter by user"
          value={filter.user}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <select
          name="status"
          value={filter.status}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="">Filter by status</option>
          <option value="Active">Active</option>
          <option value="Deleted">Deleted</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((file, index) => (
              <tr key={file._id}>
                <td className="border px-4 py-2">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                <td className="border px-4 py-2">{file.title}</td>
                <td className="border px-4 py-2">{file.category}</td>
                <td className="border px-4 py-2">{file.description}</td>
                <td className="border px-4 py-2">
                  {users.find((user) => user._id === file.user)?.username || 'Unknown'}
                </td>
                <td className="border px-4 py-2">{file.deletedAt ? 'Deleted' : 'Active'}</td>
                <td className="border px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEditClick(file)}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="bg-red-500 text-white px-4 py-2 rounded text-sm"
                    >
                      Delete
                    </button>
                    {file.deletedAt && (
                      <button
                        onClick={() => handleRestore(file)}
                        className="bg-green-500 text-white px-4 py-2 rounded text-sm"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 items-center">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-l"
        >
          Prev
        </button>

        {/* Page indicator */}
        <div className="px-4 py-2">
          <span className="text-sm font-medium">
            {currentPage} / {Math.ceil(filteredFiles.length / itemsPerPage)}
          </span>
        </div>

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= filteredFiles.length}
          className="px-4 py-2 bg-gray-300 rounded-r"
        >
          Next
        </button>
      </div>


      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
            <h2 className="text-xl font-bold mb-4">Edit Audio File</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedAudio.title}
                  onChange={handleEditChange}
                  placeholder="Title"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={editedAudio.category}
                  onChange={handleEditChange}
                  placeholder="Category"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editedAudio.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  required
                ></textarea>
              </div>
              <div className="flex flex-wrap gap-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmingDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-bold mb-4">Are you sure you want to delete this audio file?</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                Confirm Delete
              </button>
              <button onClick={cancelDelete} className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudioFiles;
