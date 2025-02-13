import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const AudioList = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [filteredAudioFiles, setFilteredAudioFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]); // Unique categories
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  useEffect(() => {
    setFilteredAudioFiles(
      audioFiles.filter(audio => 
        audio.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
        (categoryFilter === "" || audio.category.toLowerCase() === categoryFilter.toLowerCase())
      )
    );
  }, [titleFilter, categoryFilter, audioFiles]);

  const fetchAudioFiles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8080/api/audio", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAudioFiles(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(audio => audio.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load audio files.");
    }
  };

  const handleEdit = (audio) => {
    setSelectedAudio(audio);
    setIsEditing(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
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

      setMessage("Audio file updated successfully.");
      setIsEditing(false);
      fetchAudioFiles();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setMessage("Failed to update audio file.");
    }
  };

  const handleDelete = (audio) => {
    setAudioToDelete(audio);
    setIsConfirmingDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8080/api/audio/${audioToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Audio file marked for deletion.");
      setIsConfirmingDelete(false);
      fetchAudioFiles();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete audio file.");
      setIsConfirmingDelete(false);
    }
  };

  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setAudioToDelete(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Uploaded Audio Files</h2>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Filter by title"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {message && <p className="text-center text-red-500 mb-4">{message}</p>}

        {filteredAudioFiles.length === 0 ? (
          <p className="text-center text-gray-600">No audio files match your search.</p>
        ) : (
          <div className="space-y-6">
            {filteredAudioFiles.map((audio) => (
              <div
                key={audio._id}
                className="bg-gray-50 p-6 rounded-lg shadow-md hover:bg-gray-100"
              >
                <h3 className="text-xl font-semibold">{audio.title}</h3>
                <p className="text-gray-600">{audio.description}</p>
                <p className="text-sm text-gray-500">Category: {audio.category}</p>
                
                {playingAudioId === audio._id ? (
                  <audio ref={audioRef} controls className="w-full mt-4" onEnded={() => setPlayingAudioId(null)}>
                    <source src={audio.fileUrl} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <button onClick={() => setPlayingAudioId(audio._id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">
                    Play
                  </button>
                )}

                {/* Edit & Delete Buttons */}
                <div className="mt-4 flex justify-between">
                  <button onClick={() => handleEdit(audio)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(audio)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Edit Form */}
        {isEditing && selectedAudio && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Edit Audio</h2>
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block font-semibold">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedAudio.title}
                    required
                    className="w-full p-2 border rounded mt-2"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block font-semibold">Category</label>
                  <select
                    name="category"
                    defaultValue={selectedAudio.category}
                    required
                    className="w-full p-2 border rounded mt-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block font-semibold">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedAudio.description}
                    required
                    className="w-full p-2 border rounded mt-2"
                  />
                </div>
                <div>
                  <label htmlFor="audioFile" className="block font-semibold">Audio File</label>
                  <input
                    type="file"
                    name="audioFile"
                    className="w-full p-2 border rounded mt-2"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isConfirmingDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold mb-4">Are you sure you want to delete this audio file?</p>
              <div className="flex justify-between">
                <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                  Confirm Delete
                </button>
                <button onClick={cancelDelete} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AudioList;
