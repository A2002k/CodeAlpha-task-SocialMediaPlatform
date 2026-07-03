import { useEffect, useState } from "react";
import API from "../../src/api/axios";
import { Heart, X } from "lucide-react";
import "./StoryViewer.css";

function StoryViewer({
  story,
  stories,
  currentIndex,
  setCurrentIndex,
  onClose,
}) {
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  const [showViewers, setShowViewers] = useState(false);
  const isOwner = story.user?._id === currentUser?._id || story.user?._id === currentUser?.id;

  useEffect(() => {
    setProgress(0);
    setLiked(false);
    API.put(`/stories/${story._id}/view`).catch(() => {});
  }, [story]);

  const nextStory = () => {
    if (currentIndex === stories.length - 1) {
      onClose();
      return;
    }

    setCurrentIndex(currentIndex + 1);
  };

  const previousStory = () => {
    if (currentIndex === 0) return;

    setCurrentIndex(currentIndex - 1);
  };

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          nextStory();
          return 100;
        }

        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, currentIndex]);

  const sendStoryReply = async (e) => {
  e.preventDefault();

  if (!replyText.trim()) return;

  try {
    const conversationRes = await API.post("/messages/conversation", {
      receiverId: story.user._id,
    });

    await API.post("/messages", {
      conversationId: conversationRes.data._id,
      text: `Replied to your story: ${replyText}`,
    });

    setReplyText("");
    alert("Reply sent");
  } catch (err) {
    alert(err.response?.data?.message || "Error sending reply");
  }
};

  const toggleLike = async () => {
    try {
      await API.put(`/stories/${story._id}/like`);
      setLiked((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="story-viewer"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="story-progress">
        <div
          className="story-progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <button
        className="story-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={28} />
      </button>

      <div className="story-user">
        <div className="story-user-avatar">
          {story.user?.profileImage ? (
            <img src={story.user.profileImage} alt={story.user.name} />
          ) : (
            story.user?.name?.charAt(0)
          )}
        </div>

        <span>{story.user?.name}</span>
      </div>

      <img src={story.image} className="story-full-image" alt="story" />

      <div
        className="story-left-zone"
        onClick={(e) => {
          e.stopPropagation();
          previousStory();
        }}
      />

      <div
        className="story-right-zone"
        onClick={(e) => {
          e.stopPropagation();
          nextStory();
        }}
      />

      <form className="story-reply-form" onSubmit={sendStoryReply}>
        <input
            type="text"
            placeholder={`Reply to ${story.user?.name}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
        />

        <button type="submit" onClick={(e) => e.stopPropagation()}>
            Send
        </button>
        </form>
         
      <button
        className="story-like-btn"
        onClick={(e) => {
          e.stopPropagation();
          toggleLike();
        }}
      >
        <Heart
          fill={liked ? "#ef4444" : "transparent"}
          color={liked ? "#ef4444" : "white"}
        />
      </button>
        {isOwner && (
  <button
    className="story-viewers-btn"
    onClick={(e) => {
      e.stopPropagation();
      setShowViewers(true);
    }}
  >
    👀 {story.viewers?.length || 0}
  </button>
  
)}
{showViewers && (
  <div
    className="story-viewers-modal"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="story-viewers-header">
      <h3>Seen by</h3>
      <button onClick={() => setShowViewers(false)}>×</button>
    </div>

    {story.viewers?.length === 0 ? (
      <p className="no-viewers">No views yet</p>
    ) : (
      story.viewers?.map((viewer) => (
        <div className="story-viewer-user" key={viewer._id}>
          <div className="story-viewer-avatar">
            {viewer.profileImage ? (
              <img src={viewer.profileImage} alt={viewer.name} />
            ) : (
              viewer.name?.charAt(0)
            )}
          </div>

          <span>{viewer.name}</span>
        </div>
      ))
    )}
  </div>
)}
    </div>
  );
}

export default StoryViewer;