import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Write = () => {
  const { currentUser } = useContext(AuthContext);
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
      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include JWT cookie
        body: JSON.stringify({
          title: inputs.title,
          content: inputs.content,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create story");
      }

      const data = await res.json();
      console.log("✅ Story created:", data);

      // Redirect to the new story page
      navigate(`/stories/${data.id}`);
    } catch (err) {
      console.error("Error creating story:", err);
      setError(err.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 text-lg">
          🚫 You must be logged in to write a story.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">✍️ Write a New Story</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg space-y-4"
      >
        {/* Title */}
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

        {/* Content */}
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
          ></textarea>
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Publish Story
        </button>
      </form>
    </div>
  );
};

export default Write;
