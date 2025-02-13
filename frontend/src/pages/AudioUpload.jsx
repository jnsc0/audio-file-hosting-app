import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AudioUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("audioFile", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    try {
      const res = await axios.post("http://localhost:8080/api/audio/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Assuming JWT is in localStorage
        },
      });
      setMessage("Audio uploaded successfully!");
      navigate("/audio/list");
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload audio");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Upload Audio</h2>

        {message && <p className={`text-center ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>{message}</p>}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium mb-1">Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded mb-2"
            >
              <option value="">Select a category</option>
              <option value="Music">Music</option>
              <option value="Podcast">Podcast</option>
              <option value="Audiobook">Audiobook</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Audio File:</label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600 transition duration-300"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AudioUpload;
