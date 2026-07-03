import { useEffect, useState } from "react";
import API from "../../src/api/axios";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
  Repeat2,
} from "lucide-react";
import "./PostCard.css";
import { timeAgo } from "../../src/utils/timeAgo";
import { Link } from "react-router-dom";

function PostCard({ post, onPostUpdated, onPostDeleted, onPostCreated }) {
  const user = JSON.parse(sessionStorage.getItem("user"));

  const displayPost =
    post.isRepost && post.originalPost ? post.originalPost : post;

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(displayPost.caption || "");
  const [showHeart, setShowHeart] = useState(false);

  const isLiked = post.likes?.some(
    (id) => id === user?.id || id === user?._id
  );

  const isOwner =
    post.user?._id === user?._id || post.user?._id === user?.id;

  const fetchComments = async () => {
    try {
      const res = await API.get(`/posts/${post._id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const toggleLike = async () => {
    try {
      const res = await API.put(`/posts/${post._id}/like`);
      onPostUpdated(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error liking post");
    }
  };

  const handleDoubleClickLike = async () => {
    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
    }, 700);

    if (!isLiked) {
      await toggleLike();
    }
  };

  const repostPost = async () => {
    try {
      const res = await API.post(`/posts/${displayPost._id}/repost`);

      alert("Post reposted successfully!");

      if (onPostCreated) {
        onPostCreated(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error reposting post");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      const res = await API.post(`/posts/${post._id}/comment`, {
        text: commentText,
      });

      setComments([res.data, ...comments]);
      setCommentText("");
      setShowComments(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding comment");
    }
  };

  const deletePost = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/posts/${post._id}`);
      onPostDeleted(post._id);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting post");
    }
  };

  const updateCaption = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put(`/posts/${post._id}`, {
        caption: editedCaption,
      });

      onPostUpdated(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating caption");
    }
  };

  const copyPostLink = async () => {
    const link = `${window.location.origin}/post/${displayPost._id}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Post link copied");
      setShowMenu(false);
    } catch (err) {
      alert("Could not copy link");
    }
  };

  const reportPost = () => {
    alert("Post reported. Thank you for helping keep SocialSphere safe.");
    setShowMenu(false);
  };

  return (
    <div className="post-card">
      {post.isRepost && (
        <div className="repost-banner">
          <Repeat2 size={15} />
          <span>{post.user?.name} reposted</span>
        </div>
      )}

      <div className="post-header">
        <Link to={`/profile/${displayPost.user?._id || post.user?._id}`} className="post-user">
          <div className="avatar">
            {displayPost.user?.profileImage ? (
              <img
                src={displayPost.user.profileImage}
                alt={displayPost.user.name}
              />
            ) : (
              <span>{displayPost.user?.name?.charAt(0)}</span>
            )}
          </div>

          <div>
            <h4>
              {displayPost.user?.name}
              <BadgeCheck size={16} className="verified-icon" />
            </h4>
            <small>{timeAgo(displayPost.createdAt || post.createdAt)}</small>
          </div>
        </Link>

        <div className="post-menu-wrapper">
          <button className="more-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal size={22} />
          </button>

          {showMenu && (
            <div className="post-dropdown">
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    Edit Caption
                  </button>

                  <button className="delete-option" onClick={deletePost}>
                    Delete Post
                  </button>
                </>
              ) : (
                <>
                  <button className="report-option" onClick={reportPost}>
                    Report Post
                  </button>

                  <button onClick={copyPostLink}>Copy Link</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <form className="edit-caption-form" onSubmit={updateCaption}>
          <textarea
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            placeholder="Edit caption..."
          />

          <div className="edit-caption-actions">
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>

            <button type="submit">Save</button>
          </div>
        </form>
      ) : (
        displayPost.caption && (
          <p className="post-caption top">{displayPost.caption}</p>
        )
      )}

      {displayPost.image && (
        <div className="post-image-wrapper" onDoubleClick={handleDoubleClickLike}>
          <img src={displayPost.image} alt="post" className="post-image" />

          {showHeart && (
            <div className="double-tap-heart">
              <Heart size={90} fill="white" color="white" />
            </div>
          )}
        </div>
      )}

      <div className="post-actions">
        <div className="left-actions">
          <button className={isLiked ? "liked-btn" : ""} onClick={toggleLike}>
            <Heart
              size={23}
              fill={isLiked ? "#ef4444" : "transparent"}
              color={isLiked ? "#ef4444" : "#475569"}
            />
          </button>

          <button onClick={() => setShowComments(!showComments)}>
            <MessageCircle size={23} />
          </button>

          <button onClick={repostPost} title="Repost">
            <Repeat2 size={22} />
          </button>
        </div>

        <button>
          <Bookmark size={23} />
        </button>
      </div>

      <div className="post-info">
        <strong>{post.likes?.length || 0} likes</strong>

        <button
          className="view-comments"
          onClick={() => setShowComments(!showComments)}
        >
          {comments.length > 0
            ? `${showComments ? "Hide" : "View"} ${comments.length} comments`
            : "No comments yet"}
        </button>
      </div>

      <form className="comment-form" onSubmit={addComment}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        <button type="submit">Post</button>
      </form>

      {showComments && (
        <div className="comments-list">
          {comments.map((comment) => (
            <div className="comment-item" key={comment._id}>
              <div className="comment-avatar">
                {comment.user?.profileImage ? (
                  <img
                    src={comment.user.profileImage}
                    alt={comment.user.name}
                  />
                ) : (
                  comment.user?.name?.charAt(0)
                )}
              </div>

              <div className="comment-content">
                <strong>{comment.user?.name}</strong>
                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostCard;