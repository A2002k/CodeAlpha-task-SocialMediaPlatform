import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../../components/layout/Navbar";
import "../css/profile.css";
import EditProfileModal from "../../components/user/EditProfileModal";
import { useUser } from "../context/UserContext";



function Profile() {
  const { id } = useParams();
 const { user, setUser } = useUser();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/users/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      const userPosts = res.data.filter((post) => post.user?._id === id);
      setPosts(userPosts);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  //follow/unfollow
  const toggleFollow = async () => {
  try {
    const res = await API.put(`/users/${profile._id}/follow`);

    setProfile({
      ...profile,
      followers: res.data.followingStatus
        ? [...profile.followers, user.id]
        : profile.followers.filter((id) => id !== user.id),
    });
  } catch (err) {
    alert(err.response?.data?.message || "Error following user");
  }
};

//chat 
const startConversation = async () => {
  try {
    const res = await API.post("/messages/conversation", {
      receiverId: profile._id,
    });

    window.location.href = `/chat?conversation=${res.data._id}`;
  } catch (err) {
    alert(err.response?.data?.message || "Error starting chat");
  }
};

  if (!profile) return <h2 style={{ padding: "30px" }}>Loading...</h2>;

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-cover-large"></div>

          <div className="profile-main-info">
            <div className="profile-avatar-large">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} />
              ) : (
                profile.name?.charAt(0)
              )}
            </div>

            <div className="profile-text">
              <h1>{profile.name}</h1>
              <p>{profile.bio || "No bio yet."}</p>

              <div className="profile-stats-large">
                <div>
                  <strong>{posts.length}</strong>
                  <span>Posts</span>
                </div>

                <div>
                  <strong>{profile.followers?.length || 0}</strong>
                  <span>Followers</span>
                </div>

                <div>
                  <strong>{profile.following?.length || 0}</strong>
                  <span>Following</span>
                </div>
              </div>
            </div>

            {user?.id === profile._id || user?._id === profile._id ? (
              <button
                className="edit-profile-btn"
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="profile-actions">
                <button className="follow-btn" onClick={toggleFollow}>
                  {profile.followers?.some(
                    (f) => (f._id || f).toString() === (user?.id || user?._id)
                  )
                    ? "✓ Following"
                    : "+ Follow"}
                </button>

                <button className="message-btn" onClick={startConversation}>
                  Message
                </button>
              </div>
            )}

          </div>
        </div>

        <h2 className="posts-title">Posts</h2>

        <div className="profile-post-grid">
          {posts.length === 0 ? (
            <p className="no-profile-posts">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="profile-post-item">
                <img src={post.image} alt="post" />
              </div>
            ))
          )}
        </div>
      </div>
      {showEditModal && (
      <EditProfileModal
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onProfileUpdated={(updatedProfile) => {
          setProfile(updatedProfile);
          setUser(updatedProfile);
        }}
      />
    )}
    </div>
  );
}

export default Profile;