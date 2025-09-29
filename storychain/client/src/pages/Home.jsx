import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// 👇 Use env variable (falls back to localhost in dev)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const [stories, setStories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_BASE}/api/stories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStories(data))
      .catch((err) => console.error("Error fetching stories:", err));
  }, [location]); // ✅ refetch whenever route changes

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-indigo-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to StoryChain</h1>
        <p className="text-lg mb-6">
          Collaboratively create and vote on amazing stories.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/write"
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg shadow hover:bg-gray-200"
          >
            ✍️ Start Writing
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-indigo-800 text-white rounded-lg shadow hover:bg-indigo-900"
          >
            🚀 Join Now
          </Link>
        </div>
      </section>

      {/* Story Feed */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">📚 Latest Stories</h2>

        {stories.length === 0 ? (
          <p className="text-gray-500">No stories yet. Be the first to write one!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-indigo-600">{story.title}</h3>
                <p className="mt-2 text-sm text-gray-600">By {story.author}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm text-gray-700">⭐ {story.votes} votes</p>
                <Link
                  to={`/stories/${story.id}`}
                  className="mt-4 inline-block text-indigo-600 text-sm hover:underline"
                >
                  Read More →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
