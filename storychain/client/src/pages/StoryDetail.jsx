
// client/src/pages/StoryDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { API_BASE } from "../utils/apiClient";

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, token } = useContext(AuthContext);
  const [story, setStory] = useState(null);
  const [newParagraph, setNewParagraph] = useState("");

  const fetchStory = async () => {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        credentials: "include",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const errMsg = (data && (data.error || data.message)) || "Failed to fetch story";
        throw new Error(errMsg);
      }

      // server might return { story: {...}, paragraphs: [...] } or a single story object
      const payload = data?.story ? data : data;
      // normalize shape for the UI:
      const normalized = {
        id: payload?.story?.id ?? payload?.id,
        title: payload?.story?.title ?? payload?.title,
        author: payload?.story?.author ?? payload?.author,
        created_at: payload?.story?.created_at ?? payload?.created_at,
        votes: payload?.story?.votes ?? payload?.votes ?? payload?.votes_count ?? 0,
        userHasVoted: payload?.story?.userHasVoted ?? payload?.userHasVoted ?? false,
        paragraphs: payload?.paragraphs ?? payload?.story?.paragraphs ?? payload?.paragraphs ?? [],
      };

      setStory(normalized);
    } catch (err) {
      console.error("Error fetching story:", err);
      setStory(null);
    }
  };

  useEffect(() => {
    fetchStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleVote = async () => {
    try {
      const res = await fetch(`${API_BASE}/votes/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error((data && (data.error || data.message)) || "Vote failed");

      // backend might return { votes: number, userHasVoted: boolean } or the whole updated story
      const votes = data?.votes ?? data?.story?.votes ?? data?.votes_count ?? null;
      const userHasVoted = data?.userHasVoted ?? data?.story?.userHasVoted ?? null;

      setStory((prev) => prev ? {
        ...prev,
        votes: votes ?? prev.votes,
        userHasVoted: userHasVoted ?? prev.userHasVoted,
      } : prev);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleParagraphVote = async (paraId) => {
    try {
      const res = await fetch(`${API_BASE}/paragraph-votes/${paraId}`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error((data && (data.error || data.message)) || "Paragraph vote failed");

      setStory((prev) =>
        prev
          ? {
              ...prev,
              paragraphs: prev.paragraphs.map((p) =>
                p.id === paraId ? { ...p, votes: data.votes ?? p.votes, userHasVoted: data.userHasVoted ?? p.userHasVoted } : p
              ),
            }
          : prev
      );
    } catch (err) {
      console.error("Error voting paragraph:", err);
    }
  };

  const handleDeleteStory = async () => {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (res.ok) navigate("/");
      else {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        alert((data && (data.error || data.message)) || "Failed to delete story");
      }
    } catch (err) {
      console.error("Error deleting story:", err);
    }
  };

  const handleDeleteParagraph = async (paraId) => {
    try {
      const res = await fetch(`${API_BASE}/stories/paragraphs/${paraId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) fetchStory();
      else {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        alert((data && (data.error || data.message)) || "Failed to delete paragraph");
      }
    } catch (err) {
      console.error("Error deleting paragraph:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newParagraph.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/stories/${id}/paragraphs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify({ content: newParagraph }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error((data && (data.error || data.message)) || "Failed to add paragraph");
      setNewParagraph("");
      fetchStory();
    } catch (err) {
      console.error(err);
    }
  };

  if (!story) return <p className="text-center mt-10">Loading story...</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-indigo-600 mb-2">{story.title}</h2>
      <p className="text-sm text-gray-600">By {story.author}</p>
      <p className="text-xs text-gray-500 mb-4">{new Date(story.created_at).toLocaleDateString()}</p>

      <div className="flex items-center gap-4 mb-6">
        <p className="text-yellow-600 font-semibold">⭐ {story.votes ?? 0} votes</p>
        {currentUser && (
          <button
            onClick={handleVote}
            className={`px-4 py-1 rounded ${story.userHasVoted ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {story.userHasVoted ? "Unvote" : "Vote"}
          </button>
        )}
        {currentUser && currentUser.username === story.author && (
          <button
            onClick={handleDeleteStory}
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Story
          </button>
        )}
      </div>

      <h3 className="text-xl font-bold mb-4">Story Content</h3>
      {(!story.paragraphs || story.paragraphs.length === 0) ? (
        <p className="text-gray-500">No paragraphs yet. Be the first to contribute!</p>
      ) : (
        story.paragraphs.map((p) => (
          <div key={p.id} className="p-4 mb-4 bg-white shadow rounded-lg">
            <p className="text-gray-800">{p.content}</p>
            <p className="text-xs text-gray-500 mt-2">
              — {p.author}, {new Date(p.created_at).toLocaleDateString()}
            </p>
            {currentUser && (
              <button
                onClick={() => handleParagraphVote(p.id)}
                className={`mt-2 px-4 py-1 rounded ${p.userHasVoted ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {p.userHasVoted ? "Unvote" : "Vote"} ({p.votes ?? 0})
              </button>
            )}
            {currentUser && currentUser.username === p.author && (
              <button
                onClick={() => handleDeleteParagraph(p.id)}
                className="ml-2 mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        ))
      )}

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mt-8 p-6 bg-gray-100 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">✍️ Contribute to this Story</h4>
          <textarea
            value={newParagraph}
            onChange={(e) => setNewParagraph(e.target.value)}
            placeholder="Write your paragraph..."
            className="w-full p-3 border rounded-lg"
            rows="4"
          />
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Submit Paragraph
          </button>
        </form>
      ) : (
        <p className="mt-6 text-red-500">🚫 You must be logged in to contribute to this story.</p>
      )}
    </div>
  );
};

export default StoryDetail;

