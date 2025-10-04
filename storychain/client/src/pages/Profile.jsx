import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../utils/apiClient";
import { AuthContext } from "../context/authContext";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${username}`, {
        credentials: "include",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, token]);

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-indigo-600 mb-2">
        {profile.user.username}’s Profile
      </h2>
      <p className="text-gray-600 mb-6">
        Joined {new Date(profile.user.created_at).toLocaleDateString()}
      </p>

      {/* Stories */}
      <h3 className="text-2xl font-semibold mb-4">📝 Stories</h3>
      {profile.stories.length === 0 ? (
        <p className="text-gray-500 mb-6">No stories yet.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {profile.stories.map((s) => (
            <Link
              key={s.id}
              to={`/stories/${s.id}`}
              className="block p-4 bg-white shadow rounded-lg hover:bg-gray-50"
            >
              <h4 className="text-lg font-semibold">{s.title}</h4>
              <p className="text-sm text-gray-500">
                ⭐ {s.votes} votes — {new Date(s.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Contributions */}
      <h3 className="text-2xl font-semibold mb-4">✍️ Contributions</h3>
      {profile.contributions.length === 0 ? (
        <p className="text-gray-500">No contributions yet.</p>
      ) : (
        <div className="space-y-4">
          {profile.contributions.map((c) => (
            <div key={c.id} className="p-4 bg-white shadow rounded-lg">
              <p className="text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                in{" "}
                <Link to={`/stories/${c.story_id}`} className="text-indigo-600 underline">
                  {c.story_title}
                </Link>{" "}
                — ⭐ {c.votes} votes
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
