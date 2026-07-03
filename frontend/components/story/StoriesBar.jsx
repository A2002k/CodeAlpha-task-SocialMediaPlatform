import { useEffect, useState } from "react";
import API from "../../src/api/axios";
import CreateStoryModal from "./CreateStoryModal";
import StoryViewer from "./StoryViewer";
import "./StoriesBar.css";

function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await API.get("/stories");
      setStories(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <>
      <div className="stories-bar">
        <button
          className="story-card add-story"
          onClick={() => setShowStoryModal(true)}
        >
          <div className="story-avatar">+</div>
          <span>Your Story</span>
        </button>

        {stories.map((story, index) => (
          <button
            className="story-card"
            key={story._id}
            onClick={() => setActiveIndex(index)}
          >
            <div className="story-avatar">
              {story.user?.profileImage ? (
                <img src={story.user.profileImage} alt={story.user.name} />
              ) : (
                story.user?.name?.charAt(0)
              )}
            </div>

            <span>{story.user?.name}</span>
          </button>
        ))}
      </div>

      {showStoryModal && (
        <CreateStoryModal
          onClose={() => setShowStoryModal(false)}
          onStoryCreated={(newStory) => {
            setStories([newStory, ...stories]);
          }}
        />
      )}

     {activeIndex !== null && (
    <StoryViewer
        story={stories[activeIndex]}
        stories={stories}
        currentIndex={activeIndex}
        setCurrentIndex={setActiveIndex}
        onClose={() => setActiveIndex(null)}
    />
)}
    </>
  );
}

export default StoriesBar;