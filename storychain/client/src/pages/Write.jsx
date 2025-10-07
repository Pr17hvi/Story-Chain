
// client/src/pages/Write.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { API_BASE } from "../utils/apiClient";

const Write = () => {
  const { currentUser, token } = useContext(AuthContext);
  const [inputs, setInputs] = useState({ title: "", content: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(inputs),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const errMsg = (data && (data.error || data.message)) || "Failed to create story";
        throw new Error(errMsg);
      }

      // backend might return { story: {...} } or the story object
      const story = data?.story ?? data;
      navigate(`/stories/${story.id}`);
    } catch (err) {
      console.error("Error creating story:", err);
      setError(err.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 text-lg">🚫 You must be logged in to write a story.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">✍️ Write a New Story</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={inputs.title}
            onChange={handleChange}
            placeholder="Enter story title..."
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Content</label>
          <textarea
            name="content"
            value={inputs.content}
            onChange={handleChange}
            placeholder="Write your story here..."
            rows="8"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Publish Story
        </button>
      </form>
    </div>
  );
};

export default Write;

