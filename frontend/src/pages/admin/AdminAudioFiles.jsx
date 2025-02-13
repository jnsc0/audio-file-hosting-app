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
      // await axios.put(`http://localhost:8080/api/audio/${selectedAudio._id}`, editedAudio, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
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
      window.location.reload();
    } catch (error) {
      console.error('Error updating audio file', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Audio Files</h1>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Category</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.map((file) => (
            <tr key={file._id}>
              <td className="border px-4 py-2">{file.title}</td>
              <td className="border px-4 py-2">{file.category}</td>
              <td className="border px-4 py-2">{file.description}</td>
              <td className="border px-4 py-2">
                {users.find((user) => user._id === file.user)?.username || 'Unknown'}
              </td>
              <td className="border px-4 py-2">{file.deletedAt ? 'Deleted' : 'Active'}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEditClick(file)} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Audio File</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={editedAudio.title}
                onChange={handleEditChange}
                placeholder="Title"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="category"
                value={editedAudio.category}
                onChange={handleEditChange}
                placeholder="Category"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                value={editedAudio.description}
                onChange={handleEditChange}
                placeholder="Description"
                className="w-full p-2 border rounded"
                required
              ></textarea>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudioFiles;
