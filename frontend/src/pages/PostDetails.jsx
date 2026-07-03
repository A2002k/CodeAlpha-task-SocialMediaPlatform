import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

import Navbar from "../../components/layout/Navbar";
import PostCard from "../../components/post/PostCard";

function PostDetails() {
  const { id } = useParams();

  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await API.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  if (!post) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "700px",
          margin: "35px auto",
        }}
      >
        <PostCard
          post={post}
          onPostUpdated={setPost}
          onPostDeleted={() => window.history.back()}
        />
      </div>
    </>
  );
}

export default PostDetails;