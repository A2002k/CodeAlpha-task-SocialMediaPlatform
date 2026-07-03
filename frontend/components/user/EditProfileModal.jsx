import { useState } from "react";
import API from "../../src/api/axios";
import { Camera, X, Loader2 } from "lucide-react";
import "./EditProfileModal.css";

function EditProfileModal({ profile, onClose, onProfileUpdated }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(profile.profileImage || "");
  const [loading, setLoading] = useState(false);

  const maxBioLength = 150;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "bio" && value.length > maxBioLength) return;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await API.put("/users/me/profile", formData);

      onProfileUpdated(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-profile-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-title">
          <h2>Edit Profile</h2>
          <p>Update your profile information</p>
        </div>

        <form onSubmit={saveProfile}>
          <div className="profile-preview-wrapper">
            <div className="profile-preview">
              {preview ? (
                <img src={preview} alt="profile" />
              ) : (
                <span>{form.name?.charAt(0)}</span>
              )}
            </div>

            <label className="change-photo-btn">
              <Camera size={18} />
              Change Photo
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              placeholder="Write something about yourself..."
              value={form.bio}
              onChange={handleChange}
            />

            <span className="bio-counter">
              {form.bio.length}/{maxBioLength}
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;