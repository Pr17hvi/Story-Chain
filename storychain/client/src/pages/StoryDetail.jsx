// client/src/pages/StoryDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { API_BASE } from "../utils/apiClient";

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [story, setStory] = useState(null);
  const [newParagraph, setNewParagraph] = useState("");

  const fetchStory = async () => {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch story");
      }

      setStory(data);
    } catch (err) {
      console.error("Error fetching story:", err);
      setStory(null);
    }
  };

  useEffect(() => {
    fetchStory();
  }, [id]); // ✅ removed token dependency

  const handleVote = async () => {
    try {
      const res = await fetch(`${API_BASE}/votes/${id}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      setStory((prev) => ({
        ...prev,
        votes: data.votes,
        userHasVoted: data.userHasVoted,
      }));
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleParagraphVote = async (paraId) => {
    try {
      const res = await fetch(
        `${API_BASE}/paragraph-votes/${paraId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      setStory((prev) => ({
        ...prev,
        paragraphs: prev.paragraphs.map((p) =>
          p.id === paraId
            ? {
                ...p,
                votes: data.votes,
                userHasVoted: data.userHasVoted,
              }
            : p
        ),
      }));
    } catch (err) {
      console.error("Error voting paragraph:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newParagraph.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE}/stories/${id}/paragraphs`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newParagraph }),
        }
      );

      if (!res.ok) throw new Error("Failed to add paragraph");

      setNewParagraph("");
      fetchStory();
    } catch (err) {
      console.error(err);
    }
  };

  if (!story)
    return <p className="text-center mt-10">Loading story...</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-indigo-600 mb-2">
        {story.title}
      </h2>
      <p className="text-sm text-gray-600">
        By {story.author}
      </p>

      <div className="flex items-center gap-4 mb-6">
        <p className="text-yellow-600 font-semibold">
          ⭐ {story.votes ?? 0} votes
        </p>

        {currentUser && (
          <button
            onClick={handleVote}
            className={`px-4 py-1 rounded ${
              story.userHasVoted
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {story.userHasVoted ? "Unvote" : "Vote"}
          </button>
        )}
      </div>

      {story.paragraphs?.map((p) => (
        <div
          key={p.id}
          className="p-4 mb-4 bg-white shadow rounded-lg"
        >
          <p>{p.content}</p>
          <p className="text-xs text-gray-500 mt-2">
            — {p.author}
          </p>

          {currentUser && (
            <button
              onClick={() => handleParagraphVote(p.id)}
              className={`mt-2 px-4 py-1 rounded ${
                p.userHasVoted
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {p.userHasVoted ? "Unvote" : "Vote"} (
              {p.votes ?? 0})
            </button>
          )}
        </div>
      ))}

      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 p-6 bg-gray-100 rounded-lg shadow"
        >
          <textarea
            value={newParagraph}
            onChange={(e) =>
              setNewParagraph(e.target.value)
            }
            placeholder="Write your paragraph..."
            className="w-full p-3 border rounded-lg"
            rows="4"
          />
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Submit Paragraph
          </button>
        </form>
      )}
    </div>
  );
};

export default StoryDetail;
