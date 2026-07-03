import { useState } from "react";
import API from "../../src/api/axios";
import ImageEditor from "./ImageEditor";
import "./CreatePost.css";

function CreatePost({ onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);

  const dataURLToFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setEditing(true);
    }
  };

  const handleEditorDone = (editedImageUrl, tagsFromEditor = []) => {
    const editedFile = dataURLToFile(editedImageUrl, "edited-post.png");

    setImage(editedFile);
    setPreview(editedImageUrl);
    setTaggedUsers(tagsFromEditor);
    setEditing(false);
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please choose an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("image", image);
      formData.append("taggedUsers", JSON.stringify(taggedUsers));

      const res = await API.post("/posts", formData);

      onPostCreated(res.data);

      setCaption("");
      setImage(null);
      setPreview("");
      setTaggedUsers([]);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  if (editing && preview) {
    return (
      <ImageEditor
        imageUrl={preview}
        initialTaggedUsers={taggedUsers}
        onDone={handleEditorDone}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <form className="create-post" onSubmit={createPost}>
      {preview && (
        <div className="preview-wrapper">
          <img src={preview} alt="Preview" className="post-preview" />

          <button
            type="button"
            className="edit-image-btn"
            onClick={() => setEditing(true)}
          >
            Edit Image
          </button>
        </div>
      )}

      {taggedUsers.length > 0 && (
        <div className="tagged-summary">
          Tagged: {taggedUsers.length} person
          {taggedUsers.length > 1 ? "s" : ""}
        </div>
      )}

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <div className="create-actions">
        <label className="upload-label">
          📷 Choose Image / Take Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Share"}
        </button>
      </div>
    </form>
  );
}

export default CreatePost;