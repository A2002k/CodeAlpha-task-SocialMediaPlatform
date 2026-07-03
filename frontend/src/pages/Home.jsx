import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../../components/layout/Navbar";
import PostCard from "../../components/post/PostCard";
import CreatePostModal from "../../components/post/CreatePostModal";
import StoriesBar from "../../components/story/StoriesBar";
import "../css/home.css";

function Home() {
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const openModal = () => setShowCreateModal(true);

    window.addEventListener("openCreatePostModal", openModal);

    return () => {
      window.removeEventListener("openCreatePostModal", openModal);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.log("Posts error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      <div className="home-layout">
        <aside className="left-panel">
          <div className="profile-mini-card">
            <div className="profile-cover"></div>

            <div className="profile-avatar">{user?.name?.charAt(0)}</div>

            <h3>{user?.name}</h3>
            <p>Welcome to SocialSphere</p>

            <div className="profile-stats">
              <div>
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>

              <div>
                <strong>{user?.followers?.length || 0}</strong>
                <span>Followers</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="feed-container">
          <StoriesBar />
          {posts.length === 0 ? (
            <div className="empty-feed">
              <h3>No posts yet</h3>
              <p>Click the + button to create your first post.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={(updatedPost) => {
                  setPosts(
                    posts.map((p) =>
                      p._id === updatedPost._id ? updatedPost : p
                    )
                  );
                }}
                onPostDeleted={(postId) => {
                  setPosts(posts.filter((p) => p._id !== postId));
                }}

                onPostCreated={(newPost) => {
                  setPosts((prev) => [newPost, ...prev]);
                }}
              />
            ))
          )}
        </main>

        <aside className="right-panel">
          <div className="suggestion-card">
            <h3>Suggested Creators</h3>

            <div className="suggestion-user">
              <div className="suggestion-avatar">A</div>
              <div>
                <strong>Anthony</strong>
                <p>Full Stack Developer</p>
              </div>
            </div>

            <div className="suggestion-user">
              <div className="suggestion-avatar">J</div>
              <div>
                <strong>John</strong>
                <p>UI Designer</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={(newPost) => {
            setPosts([newPost, ...posts]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Home;