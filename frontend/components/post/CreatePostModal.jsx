import CreatePost from "./CreatePost";
import "./CreatePostModal.css";

function CreatePostModal({ onClose, onPostCreated }) {
  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-modal-header">
          <h2>Create New Post</h2>
          <button onClick={onClose}>×</button>
        </div>

        <CreatePost onPostCreated={onPostCreated} />
      </div>
    </div>
  );
}

export default CreatePostModal;