import { useState } from "react";
import API from "../../src/api/axios";
import "./CreateStoryModal.css";

function CreateStoryModal({ onClose, onStoryCreated }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const createStory = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please choose an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", image);

      const res = await API.post("/stories", formData);

      onStoryCreated(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-modal-overlay" onClick={onClose}>
      <form className="story-modal" onSubmit={createStory} onClick={(e) => e.stopPropagation()}>
        <div className="story-modal-header">
          <h2>Create Story</h2>
          <button type="button" onClick={onClose}>×</button>
        </div>

        {preview && <img src={preview} alt="Story preview" className="story-preview" />}

        <label className="story-upload-btn">
          📷 Choose Image / Take Photo
          <input type="file" accept="image/*" capture="environment" onChange={handleImage} />
        </label>

        <button className="story-share-btn" type="submit" disabled={loading}>
          {loading ? "Sharing..." : "Share Story"}
        </button>
      </form>
    </div>
  );
}

export default CreateStoryModal;